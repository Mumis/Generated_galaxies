import { Group, Vector3 } from "three";
import { Renderer } from "../Renderer/Renderer";

export class Entity {
    public object: Group;

    public update(dt: number, elapsedTime: number, renderer: Renderer): void {
        // Intentionally left empty
    }
}