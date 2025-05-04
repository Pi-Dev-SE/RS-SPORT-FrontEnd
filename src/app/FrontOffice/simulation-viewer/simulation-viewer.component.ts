import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, ComponentFactoryResolver, Injector, ApplicationRef } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { SimulationService } from '../../services/simulation.service';
import { finalize } from 'rxjs';
import { BodyPartLabelComponent } from '../body-part-label/body-part-label.component';

interface BodyPartInfo {
  name: string;
  position: THREE.Vector3;
  muscleInfo?: string;
  riskLevel?: 'high' | 'medium' | 'low' | 'none';
}

@Component({
  selector: 'app-simulation-viewer',
  templateUrl: './simulation-viewer.component.html',
  styleUrls: ['./simulation-viewer.component.css']
})
export class SimulationViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasRef!: ElementRef;
  
  // Form with default values
  form = { 
    duration: 10, 
    surface: 'grass', 
    temperature: 30 
  };
  
  // UI states
  isLoading = false;
  errorMessage: string | null = null;
  simulationComplete = false;
  showAnnotations = true;
  
  // THREE.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private labelRenderer!: CSS2DRenderer;
  private controls!: OrbitControls;
  private playerModel!: THREE.Group;
  private animationFrameId!: number;
  private annotations: CSS2DObject[] = [];
  
  // Body part mapping to mesh names in the model
  private partNameMapping: { [key: string]: string } = {
    "Object_2": "Hip_L",
    "Object_9": "Ankle_R",
    //"Object_4": "Shoulder_L",
    //"Object_5": "Shoulder_R",
    "Object_3": "Knee_L", //3
    "Object_7": "Knee_R",
    "Object_8": "Lower_back",
    //"Object_9": "Elbow_R",
    "Object_10": "Calves_L",
    "Object_11": "Calves_R",
    "Object_12": "Ankle_L",
    "Object_13": "Hip_R"
  };
  
  // Body part metadata with positions and info
  private bodyPartDetails: { [key: string]: BodyPartInfo } = {
    "Knee_L": { 
      name: "Knee Left", 
      position: new THREE.Vector3(-0.9, -0.5, 0.1),
      muscleInfo: "Quadriceps, Hamstrings",
      riskLevel: 'none'
      
    },
    "Knee_R": { 
      name: "Knee Right", 
      position: new THREE.Vector3(0.9, -0.5, 0.1),
      muscleInfo: "Quadriceps, Hamstrings",
      riskLevel: 'none'
    },
    "Ankle_L": { 
      name: "Ankle Left", 
      position: new THREE.Vector3(-1, -1.5, 0.1),
      muscleInfo: "Achilles Tendon, Anterior Talofibular Ligament",
      riskLevel: 'none'
    },
    "Ankle_R": { 
      name: "Ankle Right", 
      position: new THREE.Vector3(1.2, -1.3, 0.1),
      muscleInfo: "Achilles Tendon, Anterior Talofibular Ligament",
      riskLevel: 'none'
    },
    "Hip_L": { 
      name: "Hip Left", 
      position: new THREE.Vector3(-1.2, 0.1, 0.1),
      muscleInfo: "Hip Flexors, Adductors",
      riskLevel: 'none'
    },
    "Hip_R": { 
      name: "Hip Right", 
      position: new THREE.Vector3(0.6, 0.2, 0.1),
      muscleInfo: "Hip Flexors, Adductors",
      riskLevel: 'none'
    },
    
    "Lower_back": { 
      name: "Lower Back", 
      position: new THREE.Vector3(-0.3, -0.5, 0.1),
      muscleInfo: "Erector Spinae, Quadratus Lumborum, Multifidus",
      riskLevel: 'none'
    },
   /* "Elbow_R": { 
      name: "Elbow Right", 
      position: new THREE.Vector3(0.5, 1.3, 0.1),
      muscleInfo: "Biceps, Triceps",
      riskLevel: 'none'
    },*/
    "Calves_L": { 
      name: "calf Left", 
      position: new THREE.Vector3(-0.3, -1.5, 0.1),
      muscleInfo: "Gastrocnemius, Soleus", 
      riskLevel: 'none'
    },
    "Calves_R": { 
      name: "calf Right", 
      position: new THREE.Vector3(0.3, -1.5, 0.1),
      muscleInfo: "Gastrocnemius, Soleus", 
      riskLevel: 'none'
    },
  };
  
  // Original materials storage
  private originalMaterials = new Map<string, THREE.Material>();
  
  // Risk level colors
  private riskColors = {
    high: 0xff0000,    // Red
    medium: 0xffa500,  // Orange
    low: 0x00ff00,     // Green
    none: 0x999999     // Gray
  };
  
  constructor(
    private simulationService: SimulationService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    this.initScene();
    this.loadModel();
    this.animate();
    this.setupWindowResize();
  }

  ngOnDestroy() {
    // Clean up to prevent memory leaks
    cancelAnimationFrame(this.animationFrameId);
    this.renderer?.dispose();
    window.removeEventListener('resize', this.onWindowResize);
    
    // Remove all annotations
    this.clearAnnotations();
  }

  private initScene() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5);
    
    // Configure camera
    const aspect = this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 1, 2);
    
    // Configure renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvasRef.nativeElement.clientWidth, this.canvasRef.nativeElement.clientHeight);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);
    
    // Configure label renderer for annotations
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.canvasRef.nativeElement.clientWidth, this.canvasRef.nativeElement.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.canvasRef.nativeElement.appendChild(this.labelRenderer.domElement);
    
    // Add lights
    this.addLights();
    
    // Add camera controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
  }
  
  private addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 5, -10);
    this.scene.add(fillLight);
  }
  
  private loadModel() {
    const loader = new GLTFLoader();
    this.isLoading = true;
    
    loader.load(
      'assets/player2.glb',
      (gltf) => {
        // Successfully loaded model
        this.playerModel = gltf.scene;
        this.playerModel.scale.set(0.3, 0.3, 0.3);
        this.playerModel.position.y = -0.2;
        this.scene.add(this.playerModel);
        
        // Store original materials
        this.storeOriginalMaterials();
        
        console.log('3D model loaded successfully');
        console.log('--- Available meshes ---');
        this.playerModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            console.log((child as THREE.Mesh).name);
          }
        });
        
        // Create initial annotations
        this.createAnnotations();
        
        // Run initial simulation
        this.submitSimulation();
        
        this.isLoading = false;
      },
      // Progress
      (xhr) => {
        const progress = Math.round((xhr.loaded / xhr.total) * 100);
        console.log(`Loading: ${progress}%`);
      },
      // Error
      (error) => {
        console.error('Error loading model:', error);
        this.errorMessage = 'Could not load 3D model.';
        this.isLoading = false;
      }
    );
  }
  
  private storeOriginalMaterials() {
    if (!this.playerModel) return;
    
    this.playerModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Store original material
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material, index) => {
            this.originalMaterials.set(`${mesh.name}_${index}`, material);
          });
        } else {
          this.originalMaterials.set(mesh.name, mesh.material);
        }
      }
    });
  }
  
  private createAnnotations() {
    this.clearAnnotations();
    
    // Skip if model is not loaded or annotations disabled
    if (!this.playerModel || !this.showAnnotations) return;
    
    // Create annotations for each body part
    Object.entries(this.bodyPartDetails).forEach(([partKey, partInfo]) => {
      const labelElement = document.createElement('div');
      labelElement.className = 'body-part-label-container';
    
      const label = new CSS2DObject(labelElement);
      
      // ⚡ Positionner AVEC un décalage
      const offset = new THREE.Vector3();
      if (partKey.includes('Shoulder') || partKey.includes('Elbow') || partKey.includes('Wrist')) {
        offset.set((partInfo.position.x > 0 ? 1 : -1) * 0.5, 0, 0);
      } else if (partKey.includes('Knee') || partKey.includes('Ankle') || partKey.includes('Hip')) {
        offset.set((partInfo.position.x > 0 ? 1 : -1) * 0.4, -0.2, 0);
      } else {
        offset.set((partInfo.position.x > 0 ? 1 : -1) * 0.3, 0.3, 0);
      }
      label.position.copy(partInfo.position.clone().add(offset));
    
      this.scene.add(label);
      this.annotations.push(label);
    
      (label as any).partKey = partKey;
    
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(BodyPartLabelComponent);
      const componentRef = componentFactory.create(this.injector, [], labelElement);
    
      componentRef.instance.partName = partInfo.name;
      componentRef.instance.muscleInfo = partInfo.muscleInfo || '';
      componentRef.instance.riskLevel = partInfo.riskLevel || 'none';
      componentRef.instance.showDetails = true;
    
      this.appRef.attachView(componentRef.hostView);
    
      (label as any).componentRef = componentRef;
    });
    
  }
  
  private clearAnnotations() {
    // Remove all existing annotations and destroy Angular components
    this.annotations.forEach(annotation => {
      if ((annotation as any).componentRef) {
        this.appRef.detachView((annotation as any).componentRef.hostView);
        (annotation as any).componentRef.destroy();
      }
      this.scene.remove(annotation);
    });
    this.annotations = [];
  }
  
  private updateAnnotationColors(riskData: { [zone: string]: string }) {
    // Update annotation component properties based on risk level
    this.annotations.forEach(annotation => {
      const partKey = (annotation as any).partKey;
      if (partKey && riskData[partKey]) {
        const riskLevel = riskData[partKey] as 'high' | 'medium' | 'low' | 'none';
        const componentRef = (annotation as any).componentRef;
        
        if (componentRef && componentRef.instance) {
          // Update the component's risk level
          componentRef.instance.riskLevel = riskLevel;
          // Trigger change detection
          componentRef.changeDetectorRef.detectChanges();
        }
      }
    });
  }
  
  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
    }
  }
  
  private setupWindowResize() {
    this.onWindowResize = () => {
      if (!this.camera || !this.renderer || !this.labelRenderer) return;
      
      const width = this.canvasRef.nativeElement.clientWidth;
      const height = this.canvasRef.nativeElement.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.labelRenderer.setSize(width, height);
    };
    
    window.addEventListener('resize', this.onWindowResize);
  }
  
  private onWindowResize = () => {};
  
  /**
   * Toggle annotations visibility
   */
  toggleAnnotations() {
    this.showAnnotations = !this.showAnnotations;
    if (this.showAnnotations) {
      this.createAnnotations();
    } else {
      this.clearAnnotations();
    }
  }
  
  /**
   * Method called by the form to start simulation
   */
  submitSimulation() {
    if (!this.playerModel) {
      console.warn('Model not loaded, cannot simulate');
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    
    this.simulationService.getSimulationResult(this.form)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          // Update risk levels in bodyPartDetails
          Object.entries(data.risks).forEach(([key, riskLevel]) => {
            if (this.bodyPartDetails[key]) {
              this.bodyPartDetails[key].riskLevel = riskLevel as 'high' | 'medium' | 'low' | 'none';
            }
          });
          
          this.applyRiskColors(data.risks);
          this.updateAnnotationColors(data.risks);
          this.simulationComplete = true;
        },
        error: (err) => {
          console.error('Error during simulation:', err);
          this.errorMessage = 'Error retrieving results.';
          this.resetModelColors();
        }
      });
  }
  
  /**
   * Apply risk colors to the 3D model
   */
  private applyRiskColors(riskData: { [zone: string]: string }) {
    if (!this.playerModel) return;
    
    // First reset all colors
    this.resetModelColors();
    
    // Apply new colors based on risk level
    this.playerModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const bodyPartName = this.partNameMapping[mesh.name];
        
        if (bodyPartName && bodyPartName in riskData) {
          const riskLevel = riskData[bodyPartName];
          const color = this.getColorForRisk(riskLevel);
          
          // Create new material with visual effects based on risk level
          mesh.material = this.createRiskMaterial(color, riskLevel);
          
          // Highlight the part with slight pulsation for high risks
          if (riskLevel === 'high') {
            this.addPulsationEffect(mesh);
          }
        }
      }
    });
  }
  
  /**
   * Reset model colors to original values
   */
  private resetModelColors() {
    if (!this.playerModel) return;
    
    this.playerModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Restore original material if it exists
        const originalMaterial = this.originalMaterials.get(mesh.name);
        if (originalMaterial) {
          mesh.material = originalMaterial.clone();
        }
      }
    });
  }
  
  /**
   * Return color corresponding to risk level
   */
  private getColorForRisk(risk: string): number {
    return this.riskColors[risk as keyof typeof this.riskColors] || this.riskColors.none;
  }
  
  /**
   * Create material with visual effects adapted to risk level
   */
  private createRiskMaterial(color: number, riskLevel: string): THREE.Material {
    // Configure emission intensity based on risk level
    let emissiveIntensity = 0;
    switch (riskLevel) {
      case 'high': emissiveIntensity = 0.7; break;
      case 'medium': emissiveIntensity = 0.4; break;
      case 'low': emissiveIntensity = 0.2; break;
    }
    
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: emissiveIntensity,
      metalness: 0.2,
      roughness: 0.5,
      transparent: riskLevel === 'high',
      opacity: riskLevel === 'high' ? 0.9 : 1.0
    });
  }
  
  /**
   * Add pulsation effect to high-risk parts
   */
  private addPulsationEffect(mesh: THREE.Mesh) {
    // Create pulsation animation
    // This would be implemented with a proper animation system
    // For now, just using a simple opacity adjustment
    let pulseDirection = 1;
    let opacity = 0.8;
    
    const pulse = () => {
      if (!mesh.material) return;
      
      const material = mesh.material as THREE.MeshStandardMaterial;
      
      // Update opacity for pulsing effect
      opacity += 0.01 * pulseDirection;
      if (opacity >= 1) {
        pulseDirection = -1;
      } else if (opacity <= 0.7) {
        pulseDirection = 1;
      }
      
      material.opacity = opacity;
      
      // Continue animation
      requestAnimationFrame(pulse);
    };
    
    // Start pulsation
    pulse();
  }
}