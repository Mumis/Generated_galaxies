import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Group, Material, Mesh, MeshBasicMaterial, Points, ShaderMaterial, UniformsLib, Vector3 } from "three";
import { Renderer } from "../../Renderer/Renderer";
import { Entity } from "../Entity";

interface objectI {
    particlesCount: number,
    speed: number,
    size: number,
    color?: Color,
    offset?: number,
    opacity: number,
    frequency: number
}

export class Background extends Entity {
    public object = new Group();
    private materials: ShaderMaterial[] = [];

 
    constructor() {
        super();
        const mainCloudColor = new Color(0x6b9ab8);
        mainCloudColor.offsetHSL(Math.random() * 100, 0, 0);

        const secondaryCloudColor = new Color(0x584383);
        secondaryCloudColor.offsetHSL(Math.random() * 100, 0, 0);

        this.addObject({ // white
            particlesCount: 1000,
            speed: 0.0,
            size: 10,
            opacity: .8,
            color: new Color(0xffffff),
            frequency: 200
        });

        this.addObject({ // purples
            particlesCount: 10,
            speed: 0.0,
            size: 2000,
            opacity: 0.05,
            color: secondaryCloudColor,
            frequency: 200
        });

        this.addObject({ // blues
            particlesCount: 10,
            speed: 0.0,
            size: 2000,
            opacity: 0.05,
            color: mainCloudColor,
            frequency: 2
        });
    }

    public update(dt: number, elapsedTime: number, renderer: Renderer): void {
        for (const material of this.materials) {
            material.uniforms.elapsedTime.value = elapsedTime;
            material.uniforms.cameraPos.value = renderer.camera.position;
        }
    }

    private addObject(options: objectI): void {
        const geometry = new BufferGeometry;
        const posArray = new Float32Array(options.particlesCount * 3);
        const alphas = new Float32Array(options.particlesCount * 1);

        for (let i = 0; i < options.particlesCount; i++) {
            posArray.set(
                [
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
                ],i*3);
        }

        for (var i = 0; i < options.particlesCount; i++) {
            alphas[i] = Math.random(); // set random alphas
        }
    
        geometry.setAttribute("alpha", new BufferAttribute(alphas, 1));
        geometry.setAttribute("position", new BufferAttribute(posArray, 3));

        const uniforms = {
            color: { value: options.color },
            elapsedTime: { value: 0.0 },
            speed: { value: options.speed },
            size: { value: options.size },
            cameraPos: { value: new Vector3(0, 0, 0)},
            opacity: { value: options.opacity },
            frequency: { value: options.frequency }
        }

        const material = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
            transparent: true,
            depthWrite: false
        });

        this.materials.push(material);

        const mesh = new Points(geometry, material);
    

        this.object.add(mesh);
    }
}

function fragmentShader() {
    return `
        uniform vec3 color;
        uniform vec3 cameraPos;
        uniform float opacity;
        varying vec3 pointPos;
        
        void main() {
            vec2 cxy = gl_PointCoord * 2. - 1.;

            float alpha = (1. - pow(dot(cxy,cxy),.3)) - distance(pointPos, cameraPos) / 18.;

            gl_FragColor = vec4(color, alpha * opacity);
        }
    `
}

function vertexShader() {
    return `
        uniform float elapsedTime;
        uniform float direction;
        uniform float speed;
        uniform float size;
        uniform float frequency;
        uniform vec3 cameraPos;
        varying float noise;
        varying vec3 pointPos;
        varying float pointSize;

        //	Classic Perlin 3D Noise 
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float cnoise(vec3 P){
        vec3 Pi0 = floor(P); // Integer part for indexing
        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
        Pi0 = mod(Pi0, 289.0);
        Pi1 = mod(Pi1, 289.0);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 / 7.0;
        vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 / 7.0;
        vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
        }

        mat3 rotation3dY(float angle) {
            float s = sin(angle);
            float c = cos(angle);

            return mat3(
                c, 0.0, -s,
                0.0, 1.0, 0.0,
                s, 0.0, c
            );
        }

        void main() {                       
            float sizeNoise = (cnoise(position*frequency) * 0.5 + 0.5) * size;

            pointSize = sizeNoise - distance(cameraPos, position);
            
            pointPos = vec3((rotation3dY(elapsedTime*(sizeNoise*speed))*position));

            vec4 mvPosition = modelViewMatrix * vec4(pointPos, 1.0);

            gl_Position = modelMatrix * projectionMatrix * mvPosition;
            gl_PointSize = pointSize;
        }
    `
}