import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Group, Material, Mesh, MeshBasicMaterial, Object3D, Points, ShaderMaterial, Sphere, SphereGeometry, UniformsLib, Vector3 } from "three";
import { Renderer } from "../../Renderer/Renderer";
import { Entity } from "../Entity";

interface options {
    texture?: string,
    size: number,
    offsetFromCenter: number
    color: Color
}

export class Planet extends Entity {
    public object = new Group();
    private planet: Object3D;
    private following: boolean;
    private hovering: boolean;
    private resetCameraPosition: boolean = false;
    private uMouse: Vector3 = new Vector3();

    private speed: number = 0;
    private originalSpeed: number = 0;

    private scale: number = 0;
    private originalScale: number = 0;

    constructor(options: options) {
        super();
        const outerGeometry = new SphereGeometry( 1, 32, 16 );
        const outerMaterial = new MeshBasicMaterial( { color: options.color, opacity: 0.8, transparent: true} );

        this.planet = new Mesh( outerGeometry, outerMaterial );

        this.planet.rotation.x = Math.PI / 5;
        this.planet.position.x = options.offsetFromCenter;

        this.object.add(this.planet);
        this.object.rotation.y = (Math.random() * 2) * Math.PI;

        this.originalSpeed = options.size * 0.008;
        this.speed = this.originalSpeed;

        this.originalScale = options.size*0.003;
        this.scale = this.originalScale;
        this.planet.scale.set(this.originalScale, this.originalScale, this.originalScale);

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
        this.object.rotation.y += this.speed * dt;
        this.planet.rotation.y += 0.5 * dt;
        
        
        if (this.resetCameraPosition) {
            renderer.cameraTargetPosition = renderer.cameraOriginalPosition;
            this.resetCameraPosition = false;
            return;
        }
        
        const intersects = renderer.raycaster.intersectObject(this.planet);
        
        if (intersects[0]) {
            this.uMouse.copy(intersects[0].point);
            this.speed = 0;
            this.planet.scale.set(this.scale * 2, this.scale * 2, this.scale * 2);
            return;
        }

        this.speed = this.originalSpeed;
        this.planet.scale.set(this.originalScale, this.originalScale, this.originalScale);
                
        // if (renderer.raycaster.intersectObject(this.planet).length > 1) {
        //     console.log("test")
        //     this.hovering = true;
        //     // renderer.targetSpeed = 0.2;
        // } else {
        //     // renderer.targetSpeed = renderer.originalSpeed;
        // }
        
        if (this.following) {
            renderer.cameraTargetPosition = new Vector3(this.planet.position.x+0.2, this.planet.position.y+0.2, this.planet.position.z);
        }
        this.hovering = false;
    }
}