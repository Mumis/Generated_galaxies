import { BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, Points, Raycaster, ShaderMaterial, SphereBufferGeometry, Vector2, Vector3 } from "three";
import { Renderer } from "../../Renderer/Renderer";
import { Entity } from "../Entity";

function lerp(a: number, b: number, t: number) {
    return a*(1-t) + b*t;
}

interface objectI {
    particlesCount: number,
    minRadius: number,
    maxRadius: number,
    color: Color,
    size: number,
    sizeNoiseFrequency: number,
    speedScalar: number,
    sizeSpeedScalar: number
    opacity: number,
    startTime: number
    randomnessScale: number
}


export class Cloud extends Entity {
    public object = new Group();
    private materials: ShaderMaterial[] = [];

    private plane: Object3D;

    private uMouse: Vector3 = new Vector3();

    constructor(canvas: HTMLCanvasElement) {
        super();

        this.plane = new Mesh(
            new PlaneBufferGeometry(6, 6).rotateX(Math.PI/-2),
            new MeshBasicMaterial({color: 0xf00000, opacity: 0, transparent: true, depthWrite: false, side: DoubleSide })
        );
        
        this.object.add(this.plane);

        const mainCloudColor = new Color(0x6b9ab8);
        mainCloudColor.offsetHSL(Math.random() * 360, 0, 0);

        const mainCloudColorDarker = mainCloudColor.clone();
        mainCloudColorDarker.offsetHSL(0, 0, Math.random() * -100);

        let speedScalar = Math.random() * 2.5;
        speedScalar *= Math.round(Math.random()) ? 1 : -1;

        this.addObject({ //clouds purple
            particlesCount: 100,
            color: mainCloudColorDarker,
            minRadius: 0.2,
            maxRadius: 1.7,
            size: 1000,
            opacity: 0.011,
            speedScalar: 60 * speedScalar,
            sizeNoiseFrequency: 4,
            sizeSpeedScalar: 0.0001 * speedScalar,
            startTime: 400,
            randomnessScale: .05,
        });

        this.addObject({ // pruple cloud
            particlesCount: 10000,
            color: mainCloudColorDarker,
            minRadius: 0.3,
            maxRadius: 2.,
            size: 100,
            opacity: 0.01,
            speedScalar: 60 * speedScalar,
            sizeNoiseFrequency: 4,
            sizeSpeedScalar: 0.0001 * speedScalar,
            startTime: 400,
            randomnessScale: .05,
        });

        this.addObject({ // blue cloud 5rd last
            particlesCount: 1000,
            color: mainCloudColor,
            minRadius: 0,
            maxRadius: 0.4,
            size: 40,
            opacity: 0.05,
            speedScalar: 60 * speedScalar,
            sizeNoiseFrequency: 4,
            sizeSpeedScalar: 0.00001 * speedScalar,
            startTime: 3000,
            randomnessScale: .05,
        });

        this.addObject({ // blue cloud 4rd last
            particlesCount: 1000,
            color: mainCloudColorDarker,
            minRadius: 0.2,
            maxRadius: 0.4,
            size: 40,
            opacity: 0.05,
            speedScalar: 60 * speedScalar,
            sizeNoiseFrequency: 4,
            sizeSpeedScalar: 0.00001 * speedScalar,
            startTime: 3000,
            randomnessScale: .05,
        });

        this.addObject({ // blue cloud 3rd last
            particlesCount: 20000,
            color: mainCloudColor,
            minRadius: 0.3,
            maxRadius: 1.8,
            size: 40,
            opacity: 0.02,
            speedScalar: 60 * speedScalar,
            sizeNoiseFrequency: 4,
            sizeSpeedScalar: 0.000001 * speedScalar,
            startTime: 50000,
            randomnessScale: .05,
        });

        this.addObject({ // blue cloud 2nd last
            particlesCount: 8000,
            color: mainCloudColor,
            minRadius: 1.3,
            maxRadius: 2.1,
            size: 40,
            opacity: 0.02,
            speedScalar: 60 * speedScalar,
            sizeNoiseFrequency: 4,
            sizeSpeedScalar: 0.0001 * speedScalar,
            startTime: 400,
            randomnessScale: .05,
        });

        this.addObject({ // blue cloud last
            particlesCount: 5000,
            color: mainCloudColor,
            minRadius: 1.6,
            maxRadius: 2.7,
            size: 40,
            opacity: 0.05,
            speedScalar: 60 * speedScalar,
            sizeNoiseFrequency: 4,
            sizeSpeedScalar: 0.0001 * speedScalar,
            startTime: 400,
            randomnessScale: .07,
        });

        this.addObject({ // white stars
            particlesCount: 2000,
            minRadius: 0.2,
            maxRadius: 1.8,
            size: 8,
            opacity: 0.8,
            color: new Color(0xffffff),
            sizeNoiseFrequency: 10,
            sizeSpeedScalar: .5 * speedScalar,
            startTime: 1,
            randomnessScale: .05,
            speedScalar: 1.5 * speedScalar,
        });

        this.addObject({ // gold stars
            particlesCount: 1000,
            minRadius: 0.2,
            maxRadius: 1.8,
            size: 6,
            opacity: .8,
            color: new Color(0xFEEE44),
            sizeNoiseFrequency: 10,
            sizeSpeedScalar: .5 * speedScalar,
            startTime: 1,
            randomnessScale: .002,
            speedScalar: 1.5 * speedScalar,
        });

        this.addObject({ // white outer stars
            particlesCount: 1000,
            minRadius: 1.6,
            maxRadius: 2.1,
            size: 10,
            opacity: .5,
            color: new Color(0xffffff),
            sizeNoiseFrequency: 10,
            sizeSpeedScalar: .5 * speedScalar,
            startTime: 1,
            randomnessScale: .002,
            speedScalar: 1.5 * speedScalar,
        });
    }

    public update(dt: number, elapsedTime: number, renderer: Renderer): void {
        for (const material of this.materials) {
            material.uniforms.elapsedTime.value = elapsedTime;
            material.uniforms.cameraPos.value = renderer.camera.position;
            material.uniforms.uMouse.value = this.uMouse;
        }

        const intersects = renderer.raycaster.intersectObject(this.plane);

        if (intersects[0]) {
            this.uMouse.copy(intersects[0].point);
        }
    }

    private addObject(options: objectI): void {
        const geometry = new BufferGeometry;
        const posArray = new Float32Array(options.particlesCount * 3);

        for (let i = 0; i < options.particlesCount; i++) {
            const theta = Math.random()*2*Math.PI;
            const r = lerp(options.minRadius, options.maxRadius, Math.random());
            const x =  r*Math.sin(theta);
            const y = (Math.random()-0.5)*0.1;
            const z = r*Math.cos(theta);

            posArray.set([x,y,z],i*3);
        }

        geometry.setAttribute("position", new BufferAttribute(posArray, 3));

        const uniforms = {
            color: { value: options.color },
            elapsedTime: { value: 0.0 },
            size: { value: options.size },
            cameraPos: { value: new Vector3(0, 0, 0)},
            opacity: { value: options.opacity },
            sizeNoiseFrequency: { value: options.sizeNoiseFrequency },
            sizeSpeedScalar: { value: options.sizeSpeedScalar },
            startTime: { value: options.startTime },
            randomnessScale: { value: options.randomnessScale },
            speedScalar: { value: options.speedScalar },
            uMouse: { value: new Vector3(0, 0, 0) }
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
        varying vec3 particlePosition;
        
        void main() {
            vec2 cxy = gl_PointCoord * 2. - 1.;

            float alpha = ((1. - pow(dot(cxy,cxy),.3)) + (-2./160.*distance(particlePosition, cameraPos)));

            gl_FragColor = vec4(color, alpha * opacity);
        }
    `
}

function vertexShader() {
    return `
        uniform float elapsedTime;
        uniform float direction;
        uniform float speedScalar;
        uniform float size;
        uniform float sizeSpeedScalar;
        uniform float sizeNoiseFrequency;
        uniform float startTime;
        uniform float randomnessScale;
        uniform vec3 uMouse;
        varying float noise;
        varying float pointSize;
        uniform vec3 cameraPos;
        varying vec3 particlePosition;

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

        float saturate(float x) {
            return clamp(x, 0.0, 1.0);
        }

        vec3 fbm(vec3 p, float frequency, float offset) {
            return vec3(
                cnoise((p+vec3(offset)) * frequency),
                cnoise((p+vec3(offset)) * frequency),
                cnoise((p+vec3(offset)) * frequency)
            );
        }

        vec3 getOffset(vec3 p, float frequency) {
            float twist_scale = cnoise(position) * 0.5 + 0.5;
            vec3 tempPos = rotation3dY(elapsedTime * (0.5 + 0.5 * twist_scale)*length(position.xz)) * p;
            vec3 offset = fbm(tempPos, frequency, .0);
            return offset*0.1;
        }


        void main() {  
            float sizeNoise = (cnoise(position*sizeNoiseFrequency) * 0.5 + 0.5) * size;

            vec3 worldPosition = rotation3dY((startTime+elapsedTime*(speedScalar * 0.02))*(0.1 + sizeSpeedScalar*sizeNoise))*position;

            vec3 offset1 = getOffset(worldPosition, randomnessScale);     
            vec3 offset2 = fbm(worldPosition, randomnessScale/2., .0);
            vec3 offset3 = fbm(worldPosition, randomnessScale/4., .0);

            particlePosition = (modelMatrix*vec4(worldPosition + offset1 + offset2 + offset3, 1)).xyz;

            //hello
            float distanceToMouse = pow(1. - saturate(length(uMouse - particlePosition)), 8.);
            particlePosition.y += distanceToMouse * 0.1;
            
            vec3 dir = particlePosition - uMouse;
            particlePosition = mix(particlePosition, uMouse + normalize(dir) * 0.1, distanceToMouse);


            pointSize = sizeNoise - distance(cameraPos, particlePosition);

            vec4 mvPosition = viewMatrix * vec4(particlePosition, 1.0);

            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = pointSize;
        }
    `
}