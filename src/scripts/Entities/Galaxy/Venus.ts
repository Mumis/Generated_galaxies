import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Group, Material, Mesh, MeshBasicMaterial, Points, ShaderMaterial, Sphere, SphereGeometry, UniformsLib, Vector3 } from "three";
import { Renderer } from "../../Renderer/Renderer";
import { Entity } from "../Entity";

export class Venus extends Entity {
    public object = new Group();
    private materials: ShaderMaterial[] = [];
    private planetGroup = new Group();

    constructor() {
        super();

        const innerGeometry = new SphereGeometry( 15, 8, 4 );
        const innerMaterial = new MeshBasicMaterial( { color: 0xD4A567, wireframe: true} );
        const innerSphere = new Mesh( innerGeometry, innerMaterial );
        innerSphere .scale.set(0.0009, 0.0009, 0.0009);
        this.planetGroup.add( innerSphere  );

        const outerGeometry = new SphereGeometry( 15, 32, 16 );
        const outerMaterial = new MeshBasicMaterial( { color: 0xEECB8B, opacity: 0.8, transparent: true} );
        const outerSphere = new Mesh( outerGeometry, outerMaterial );
        outerSphere .scale.set(0.001, 0.001, 0.001);
        this.planetGroup.add( outerSphere  );

        this.planetGroup.rotation.x = Math.PI / 5;
        this.planetGroup.position.x = 0.3;

        this.object.rotation.y = (Math.random() * 2) * Math.PI;

        this.object.add(this.planetGroup);
    }

    public update(dt: number, elapsedTime: number, renderer: Renderer): void {
        for (const material of this.materials) {
            material.uniforms.cameraPos.value = renderer.camera.position;
        }
        this.object.rotation.y += 0.4 * dt;
        this.planetGroup.rotation.y += 0.5 * dt;
    }
}