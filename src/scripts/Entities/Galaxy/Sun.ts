import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Group, Material, Mesh, MeshBasicMaterial, Points, ShaderMaterial, Sphere, SphereGeometry, UniformsLib, Vector3 } from "three";
import { Renderer } from "../../Renderer/Renderer";
import { Entity } from "../Entity";

export class Sun extends Entity {
    public object = new Group();
    private materials: ShaderMaterial[] = [];
    private following: boolean;
    private hovering: boolean;
    private resetCameraPosition: boolean = false;

    constructor() {
        super();
        const innerGeometry = new SphereGeometry( 15, 8, 4 );
        const innerMaterial = new MeshBasicMaterial( { color: 0xf8a53e, wireframe: true} );
        const innerSphere = new Mesh( innerGeometry, innerMaterial );
        innerSphere .scale.set(0.005, 0.005, 0.005);
        this.object.add( innerSphere  );

        const outerGeometry = new SphereGeometry( 15, 32, 16 );
        const outerMaterial = new MeshBasicMaterial( { color: 0xffe233, opacity: 0.8, transparent: true} );
        const outerSphere = new Mesh( outerGeometry, outerMaterial );
        outerSphere .scale.set(0.0052, 0.0052, 0.0052);
        this.object.add( outerSphere  );

        this.object.rotation.x = Math.PI / 5;

        window.addEventListener("click", () => {
            if (!this.hovering) {
                return;
            }

            if (this.following) {
                this.resetCameraPosition = true;
            }

            this.following = !this.following;
        });
    }

    public update(dt: number, elapsedTime: number, renderer: Renderer): void {
        for (const material of this.materials) {
            material.uniforms.cameraPos.value = renderer.camera.position;
        }

        this.object.rotation.y += 0.4 * dt;

        this.hovering = false;
        
        if (this.resetCameraPosition) {
            renderer.cameraTargetPosition = renderer.cameraOriginalPosition;
            this.resetCameraPosition = false;
            return;
        }
        
        if (renderer.raycaster.intersectObject(this.object).length > 1) {
            this.hovering = true;
            // renderer.targetSpeed = 0.2;
        } else {
            // renderer.targetSpeed = renderer.originalSpeed;
        }
        
        if (this.following) {
            renderer.cameraTargetPosition = new Vector3(this.object.position.x+0.2, this.object.position.y+0.2, this.object.position.z);
        }
    }
}