<#
.SYNOPSIS
  Encode ulang WebM fasilitas agar mulus di-scrub: keyframe rapat (VP9).

.DESCRIPTION
  Secara default, untuk tiap "<nama>.webm" di public/animated/facility/ (12 fasilitas):
  baseline keyframe diukur -> encode ulang (bila belum rapat) -> verifikasi.
  -InputFiles dapat dipakai untuk memilih sumber tertentu, termasuk MP4.
  - Keyframe paksa tiap -KeyframeEverySec detik (default 0,2 dtk) berbasis
    WAKTU (force_key_frames), jadi berlaku untuk fps berapa pun (30/60).
  - Downscale ke -Width px (default 960), buang audio/subtitle (-an -sn).
  - Sumber = file .webm yang ada (bukan master) -> pakai constrained
    quality (-Crf + -MaxBitrate) untuk meredam generation loss.

  Mesin ini butuh ffmpeg + ffprobe:
    winget install Gyan.FFmpeg

  Contoh:
    # Cek + encode yang belum rapat, hasil ke *.fixed.webm (asli tak disentuh)
    .\scripts\encode-facility.ps1

    # Encode ulang semua + timpa file asli bila verifikasi lolos
    .\scripts\encode-facility.ps1 -Force -Replace

    # Encode MP4 terpilih ke WebM, lalu hapus sumber MP4 setelah verifikasi lolos
    .\scripts\encode-facility.ps1 -InputFiles Yayasan.mp4,Tefa2.mp4,Masjid.mp4,DAK.mp4 -Replace

  Disarankan commit git dulu sebelum -Replace agar mudah rollback.
#>
[CmdletBinding()]
param(
  [string]$Dir = (Join-Path $PSScriptRoot "..\public\animated\facility"),
  [double]$KeyframeEverySec = 0.2,
  [int]$Width = 960,
  [int]$Crf = 30,
  [string]$MaxBitrate = "1500k",
  [string[]]$InputFiles = @(),
  [switch]$Force,
  [switch]$Replace
)

$ErrorActionPreference = "Stop"

$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
$ffprobe = Get-Command ffprobe -ErrorAction SilentlyContinue
if (-not $ffmpeg -or -not $ffprobe) {
  throw "ffmpeg/ffprobe tidak ditemukan di PATH. Install dulu: winget install Gyan.FFmpeg"
}

$basenames = @(
  "perpustakaan", "tefa", "gedung-tkj", "tkj-lab",
  "tkro-1", "tkro-2", "uks", "uks-2",
  "dak", "dak-2", "dak-3", "dak-studio"
)

$inputs = @()
if ($InputFiles.Count -gt 0) {
  foreach ($file in $InputFiles) {
    $path = if ([System.IO.Path]::IsPathRooted($file)) { $file } else { Join-Path $Dir $file }
    $inputs += [PSCustomObject]@{
      Path      = $path
      Base      = [System.IO.Path]::GetFileNameWithoutExtension($path)
      Extension = [System.IO.Path]::GetExtension($path)
    }
  }
}
else {
  foreach ($base in $basenames) {
    $inputs += [PSCustomObject]@{
      Path      = Join-Path $Dir "$base.webm"
      Base      = $base
      Extension = ".webm"
    }
  }
}

function Get-Fps {
  param([string]$Path)
  $raw = (& $ffprobe -v error -select_streams v:0 `
      -show_entries stream=avg_frame_rate -of default=noprint_wrappers=1:nokey=1 $Path) | Select-Object -First 1
  $parts = "$raw".Split("/")
  if ($parts.Count -eq 2 -and [double]$parts[1] -ne 0) {
    return [double]$parts[0] / [double]$parts[1]
  }
  return 30.0
}

function Get-Duration {
  param([string]$Path)
  $raw = (& $ffprobe -v error -select_streams v:0 `
      -show_entries stream=duration -of default=noprint_wrappers=1:nokey=1 $Path) | Select-Object -First 1
  $d = 0.0
  if ([double]::TryParse("$raw", [ref]$d) -and $d -gt 0) { return $d }
  $praw = (& $ffprobe -v error -show_entries format=duration `
      -of default=noprint_wrappers=1:nokey=1 $Path) | Select-Object -First 1
  if ([double]::TryParse("$praw", [ref]$d) -and $d -gt 0) { return $d }
  return 0.0
}

function Get-KeyframeCount {
  param([string]$Path)
  $keyframes = @(& $ffprobe -v error -select_streams v:0 `
    -show_entries frame=key_frame -of csv=p=0 $Path |
    Where-Object { "$($_)".Trim() -eq "1" })
  return $keyframes.Count
}

function Get-StreamKinds {
  param([string]$Path)
  return @(& $ffprobe -v error -show_entries stream=codec_type `
    -of csv=p=0 $Path)
}

$results = @()

foreach ($input in $inputs) {
  $in = $input.Path
  $base = $input.Base
  $extension = $input.Extension
  $out = Join-Path $Dir "$base.fixed.webm"
  $replacement = if ($extension -ieq ".mp4") { Join-Path $Dir "$base.webm" } else { $in }
  $row = [PSCustomObject]@{
    File          = [System.IO.Path]::GetFileName($in)
    Status        = ""
    Keyframes     = ""
    ExpectedMin   = ""
    Streams       = ""
    SizeMB        = ""
  }

  if (-not (Test-Path -LiteralPath $in)) {
    $row.Status = "SKIP (file belum ada)"
    $results += $row
    continue
  }

  if ($Replace -and $extension -ieq ".mp4" -and (Test-Path -LiteralPath $replacement) -and -not $Force) {
    $row.Status = "GAGAL (target $base.webm sudah ada; tambah -Force untuk menimpa)"
    $results += $row
    continue
  }

  $duration = Get-Duration $in
  $expected = 0
  if ($duration -gt 0) { $expected = [math]::Floor($duration / $KeyframeEverySec) }
  $row.ExpectedMin = "$expected"
  $before = Get-KeyframeCount $in
  $row.Keyframes = "$before"

  $alreadyOk = ($extension -ieq ".webm") -and ($expected -gt 0 -and $before -ge [math]::Floor($expected * 0.7)) -and `
    ((@(Get-StreamKinds $in) -join ",") -eq "video")
  if ($alreadyOk -and -not $Force) {
    $row.Status = "OK (sudah rapat + tanpa audio)"
    $row.Streams = "video"
    $row.SizeMB = "{0:N2}" -f ((Get-Item -LiteralPath $in).Length / 1MB)
    $results += $row
    continue
  }

  # --- Encode ulang ---
  $forceExpr = "expr:gte(t,n_forced*$KeyframeEverySec)"
  & $ffmpeg -y -v error -stats -i $in `
    -vf "scale=${Width}:-2" -c:v libvpx-vp9 -pix_fmt yuv420p `
    -crf $Crf -b:v $MaxBitrate `
    -force_key_frames $forceExpr -g 120 `
    -cpu-used 4 -row-mt 1 -an -sn $out
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $out)) {
    $row.Status = "GAGAL encode"
    $results += $row
    continue
  }

  # --- Verifikasi ---
  $after = Get-KeyframeCount $out
  $kinds = @(Get-StreamKinds $out)
  $row.Keyframes = "$before -> $after"
  $row.Streams = ($kinds -join ",")
  $row.SizeMB = "{0:N2}" -f ((Get-Item -LiteralPath $out).Length / 1MB)

  $passCount = ($expected -le 0) -or ($after -ge [math]::Floor($expected * 0.7))
  $passStreams = ($kinds.Count -eq 1) -and ($kinds[0] -eq "video")

  if ($passCount -and $passStreams) {
    if ($Replace) {
      if ($extension -ieq ".mp4") {
        # Hanya timpa target lama setelah output baru lolos verifikasi.
        Move-Item -LiteralPath $out -Destination $replacement -Force
        try {
          Remove-Item -LiteralPath $in -Force
          $row.Status = "OK, menggantikan MP4 (keyframe $after)"
        }
        catch {
          $row.Status = "OK $base.webm; GAGAL hapus sumber MP4"
        }
      }
      else {
        Move-Item -LiteralPath $out -Destination $replacement -Force
        $row.Status = "OK, ditimpa (keyframe $after)"
      }
    }
    else {
      $row.Status = "OK -> $base.fixed.webm (tambah -Replace utk timpa)"
    }
  }
  else {
    $row.Status = "GAGAL verifikasi (keyframe/audio)"
  }
  $results += $row
}

$results | Format-Table -AutoSize | Out-String | Write-Output
