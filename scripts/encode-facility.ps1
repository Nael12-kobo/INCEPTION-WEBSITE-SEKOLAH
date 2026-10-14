<#
.SYNOPSIS
  Encode ulang WebM fasilitas agar mulus di-scrub: keyframe rapat (VP9).

.DESCRIPTION
  Untuk tiap "<nama>.webm" di public/animated/facility/ (12 fasilitas):
  baseline keyframe diukur -> encode ulang (bila belum rapat) -> verifikasi.
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

  Disarankan commit git dulu sebelum -Replace agar mudah rollback.
#>
[CmdletBinding()]
param(
  [string]$Dir = (Join-Path $PSScriptRoot "..\public\animated\facility"),
  [double]$KeyframeEverySec = 0.2,
  [int]$Width = 960,
  [int]$Crf = 30,
  [string]$MaxBitrate = "1500k",
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
  $lines = & $ffprobe -v error -select_streams v:0 -skip_frame nokey `
    -show_entries frame=pkt_pts_time -of csv=p=0 $Path | Measure-Object -Line
  return $lines.Lines
}

function Get-StreamKinds {
  param([string]$Path)
  return @(& $ffprobe -v error -show_entries stream=codec_type `
    -of csv=p=0 $Path)
}

$results = @()

foreach ($base in $basenames) {
  $in = Join-Path $Dir "$base.webm"
  $out = Join-Path $Dir "$base.fixed.webm"
  $row = [PSCustomObject]@{
    File          = "$base.webm"
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

  $duration = Get-Duration $in
  $expected = 0
  if ($duration -gt 0) { $expected = [math]::Floor($duration / $KeyframeEverySec) }
  $row.ExpectedMin = "$expected"
  $before = Get-KeyframeCount $in
  $row.Keyframes = "$before"

  $alreadyOk = ($expected -gt 0 -and $before -ge [math]::Floor($expected * 0.7)) -and `
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
      Move-Item -LiteralPath $out -Destination $in -Force
      $row.Status = "OK, ditimpa (keyframe $after)"
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
