import json
import struct
import os

path = r"c:\Users\KIIT0001\Desktop\fun\Assets\heroes\Ryomen_Raj\ryomen_domain\ryomen_domain_glb\Happy Idle.glb"

if not os.path.exists(path):
    print("File not found at", path)
    exit()

with open(path, 'rb') as f:
    header = f.read(12)
    magic, version, length = struct.unpack('<4sII', header)
    if magic != b'glTF':
        print("Not a valid glTF binary file.")
        exit()
    
    chunk_header = f.read(8)
    chunk_len, chunk_type = struct.unpack('<II', chunk_header)
    if chunk_type != 0x4E4F534A: # JSON
        print("First chunk is not JSON.")
        exit()
        
    json_data = f.read(chunk_len).decode('utf-8')
    gltf = json.loads(json_data)
    
    print("Total Nodes:", len(gltf.get('nodes', [])))
    
    nodes = gltf.get('nodes', [])
    bone_nodes = [n for n in nodes if 'name' in n]
    
    print("\n--- Node names containing 'foot', 'toe', 'leg', 'hip' ---")
    matched = False
    for n in bone_nodes:
        name = n['name'].lower()
        if 'foot' in name or 'toe' in name or 'leg' in name or 'hip' in name or 'root' in name or 'pelvis' in name:
            print(f"Found node: '{n['name']}'")
            matched = True
            
    if not matched:
        print("No bone nodes matched search terms.")
        print("\nAll node names (first 30):")
        for i, n in enumerate(bone_nodes[:30]):
            print(f"Node {i}: '{n['name']}'")
