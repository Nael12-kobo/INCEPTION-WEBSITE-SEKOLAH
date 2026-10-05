// three.js mengharapkan global browser di Node — impor ini harus paling awal
import "./vrm-test-globals.mjs";

import fs from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";

const file = process.argv[2];
const buf = fs.readFileSync(file);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

loader.parse(
  ab,
  "",
  (gltf) => {
    const vrm = gltf.userData.vrm;
    console.log("PARSE OK");
    console.log("  vrm:", vrm ? "ada" : "TIDAK ADA");
    if (vrm) {
      console.log("  expressionManager:", vrm.expressionManager ? "ada" : "TIDAK ADA");
      const names = vrm.expressionManager ? vrm.expressionManager.expressionMap ? Object.keys(vrm.expressionManager.expressionMap) : Object.keys(vrm.expressionManager._expressionMap||{}) : [];
      console.log("  expressions:", names.length ? names.join(",") : "(? )");
      // cek morph target mesh
      const mesh = gltf.scene.getObjectByName("OsisV1Edited") || gltf.scene.children.find(c=>c.isMesh) ;
      let morphMesh = null;
      gltf.scene.traverse((o)=>{ if(o.isMesh && o.morphTargetInfluences && o.morphTargetInfluences.length) morphMesh = morphMesh || o; });
      if (morphMesh) console.log("  morphTargetInfluences:", morphMesh.morphTargetInfluences.length, "| dictionary keys:", Object.keys(morphMesh.morphTargetDictionary||{}).length);
      // uji blink + aa
      try {
        vrm.expressionManager.setValue("blink", 1);
        vrm.expressionManager.setValue("aa", 1);
        console.log("  setValue blink/aa OK, aa value =", vrm.expressionManager.getValue("aa"));
        vrm.expressionManager.setValue("blink", 0);
        vrm.expressionManager.setValue("aa", 0);
      } catch (e) { console.log("  setValue GAGAL:", e.message); }
      console.log("  springBoneManager:", vrm.springBoneManager ? "ada" : "TIDAK ADA");
      if (vrm.springBoneManager) {
        const joints = vrm.springBoneManager.joints;
        console.log("  spring joints:", joints ? (joints.size ?? joints.length ?? "?") : "?");
      }
    }
    // hitung jumlah triangle
    let tris = 0;
    gltf.scene.traverse((o)=>{ if(o.isMesh && o.geometry) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count)/3; });
    console.log("  triangles:", Math.round(tris).toLocaleString());
    process.exit(0);
  },
  (err) => { console.error("PARSE GAGAL:", err && (err.message||err)); process.exit(1); }
);
