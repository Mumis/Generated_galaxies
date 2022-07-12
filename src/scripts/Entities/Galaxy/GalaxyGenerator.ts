import { BufferAttribute, BufferGeometry, Color, Group, Points, ShaderMaterial, Vector3 } from "three";
import { Renderer } from "../../Renderer/Renderer";
import { Entity } from "../Entity";
import { Cloud } from "./Cloud";
import { Planet } from "./Planet";
import { Sun } from "./Sun";

interface Options {
    rotationX: number,
    rotationY: number,
    rotationZ: number,
    positionXOffset: number,
    positionYOffset: number,
    positionZOffset: number,
}


export class GalaxyGenerator extends Entity {
    public object = new Group();
    private objects: Entity[] = [];

    constructor(canvas: HTMLCanvasElement, options: Options) {
        super();
        const cloud = new Cloud(canvas);
        const sun = new Sun();

        this.objects.push(sun);

        const maxPlanets = 9;
        const minPlanets = 4;

        for (let i = 0; i < minPlanets + (Math.ceil(Math.random() * maxPlanets - minPlanets)); i++) {
            const planet = new Planet({
                offsetFromCenter: 0.25 + i * 0.2 + Math.random() * 0.2,
                color: new Color(Math.random() * 0xffffff),
                size: 6 + Math.random() * 20
            });

            this.objects.push(planet);
        }

        this.object.rotation.x = options.rotationX * Math.PI;
        this.object.rotation.y = options.rotationY * Math.PI;
        this.object.rotation.z = options.rotationZ * Math.PI;

        this.object.position.x = options.positionXOffset;
        this.object.position.y = options.positionYOffset;
        this.object.position.z = options.positionZOffset;

        this.objects.push(cloud);

        for (const object of this.objects) {
            this.object.add(object.object);
        }
    }

    public update(dt: number, elapsedTime: number, renderer: Renderer): void {
        for (const object of this.objects) {
            object.update(dt, elapsedTime, renderer);
        }
    }   
}