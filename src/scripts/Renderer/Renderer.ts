import { Clock, Color, Fog, Object3D, PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Entity } from "../Entities/Entity";

export class Renderer {
    private canvas: HTMLCanvasElement;
    private scene: Scene;
    private renderer: WebGLRenderer;
    
    private entities: Entity[] = [];

    private running: boolean = false;

    private controls: OrbitControls;
    
    private clock: Clock;
    private oldTime: number = 0; //start at 0sec in..

    public speed: number = 1;
    public targetSpeed: number = 1;
    public readonly originalSpeed: number = 1;
    
    public readonly camera: PerspectiveCamera;
    public readonly cameraOriginalPosition: Vector3 = new Vector3(0, 1, 2);
    public cameraTargetPosition: Vector3 = this.cameraOriginalPosition;
    public cameraLookAt: Vector3 = new Vector3(0, 0, 0);

    public raycaster: Raycaster = new Raycaster();
    public point: Vector3 = new Vector3();
    public pointer: Vector2 = new Vector2();

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.clock = new Clock;
        this.scene = new Scene();
        // this.scene.fog = new Fog(new Color(0x000000), 1, 20);

        
        this.camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        this.camera.position.set(0, 10, 10); // For nice starting animation
        this.controls = new OrbitControls( this.camera, canvas );
        this.controls.enabled = false;
        
        this.renderer = new WebGLRenderer({canvas, antialias: true, alpha: true});
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        canvas.addEventListener("pointermove", event => {
            this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        });

        window.addEventListener("resize", () => {
            this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);

            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        });
    }

    public start(): void {
        this.clock.start();
        this.running = true;
        this.update();
    }

    public stop(): void {
        this.running = false;
        this.clock.stop();
    }

    private update(): void {        
        if (!this.running) {
            return
        }
        
        this.raycaster.setFromCamera( this.pointer, this.camera );

        const dt = this.clock.getDelta();

        this.controls.update();

        if (!this.controls.enabled) {
            this.camera.lookAt(this.cameraLookAt);
            this.camera.position.lerp(this.cameraTargetPosition, 0.5 * dt);
        }
        
        this.speed = this.speed + (this.targetSpeed - this.speed) * 0.005;
        
        const elapsedTime = this.oldTime + ((this.clock.oldTime/1000 - this.clock.getElapsedTime())*this.speed)*dt;
        this.oldTime = elapsedTime;

        for (const entity of this.entities) {
            entity.update(dt*this.speed, elapsedTime, this);
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.update.bind(this));
    }

    public addEntity(entity: Entity): void {
        this.entities.push(entity);
        this.scene.add(entity.object);
    }

    public removeOEntity(entity: Entity): void {
        const index = this.entities.indexOf(entity);

        if (index >= 0) {
            this.entities.splice(index, 1);
            this.scene.remove(entity.object);
        }
    }

    public enableControls(): void {
        this.controls.enabled = true;
    }

    public disableControls(): void {
        this.controls.enabled = false;
    }
}