import {
  Vector2,
  Vector3,
  Matrix4,
  Spherical,
  Quaternion,
  MouseGesture,
  TouchGesture,
  IOrthographicCamera,
  IPerspectiveCamera,
  ORTHOGRAPHIC_CAMERA_COMPONENT_TYPE,
  PERSPECTIVE_CAMERA_COMPONENT_TYPE,
  Immutable,
  Behavior,
} from 'flexidy-engine';

type MouseButtons = {
  left: MouseGesture,
  middle: MouseGesture,
  right: MouseGesture,
};

type Touches = {
  one: TouchGesture,
  two: TouchGesture,
};

type ControlKeys = {
  left: 'ArrowLeft',
  up: 'ArrowUp',
  right: 'ArrowRight',
  bottom: 'ArrowDown',
};

enum CameraType {
  Perspective = 0,
  Orthographic = 1,
  Unknown = 2,
}

enum ControlState {
  None = -1,
  Rotate = 0,
  Dolly = 1,
  Pan = 2,
  TouchRotate = 3,
  TouchPan = 4,
  TouchDollyPan = 5,
  TouchDollyRotate = 6,
}

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const EPS = 0.000001;
const TWO_PI = 2 * Math.PI;

const _tempVec3 = new Vector3();

export class OrbitController extends Behavior {
  private camera: IOrthographicCamera|IPerspectiveCamera|null = null;

  private cameraType = CameraType.Unknown;

  private domElement: HTMLElement;

  // Set to false to disable this control
  protected enabled = true;

  // "target" sets the location of focus, where the object orbits around
  protected target = new Vector3();

  // How far you can dolly in and out ( PerspectiveCamera only )
  protected minDistance = 0;

  protected maxDistance = Infinity;

  // How far you can zoom in and out ( OrthographicCamera only )
  protected minZoom = 0;

  protected maxZoom = Infinity;

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  protected minPolarAngle = 0; // radians

  protected maxPolarAngle = Math.PI; // radians

  // How far you can orbit horizontally, upper and lower limits.
  // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
  protected minAzimuthAngle = -Infinity; // radians

  protected maxAzimuthAngle = Infinity; // radians

  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  protected enableDamping = false;

  protected dampingFactor = 0.05;

  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  protected enableZoom: boolean = false;

  protected zoomSpeed = 1.0;

  // Set to false to disable rotating
  protected enableRotate: boolean = false;

  protected rotateSpeed = 1.0;

  // Set to false to disable panning
  protected enablePan: boolean = false;

  protected panSpeed = 1.0;

  protected screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up

  protected keyPanSpeed = 7.0; // pixels moved per arrow key push

  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  protected autoRotate = false;

  protected autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

  protected mouseButtons: MouseButtons = {
    left: MouseGesture.Rotate,
    middle: MouseGesture.Dolly,
    right: MouseGesture.Pan,
  };

  protected touches: Touches = {
    one: TouchGesture.Rotate,
    two: TouchGesture.DollyPan,
  };

  protected keys: ControlKeys = {
    left: 'ArrowLeft',
    up: 'ArrowUp',
    right: 'ArrowRight',
    bottom: 'ArrowDown',
  };

  protected originalTarget = new Vector3();

  protected originalPosition = new Vector3();

  protected originalZoom: number = 1;

      // current position in spherical coordinates
  private spherical = new Spherical();

  private sphericalDelta = new Spherical();

  private panOffset = new Vector3();

  // the target DOM element for key events
  private keyEventsDom: HTMLElement|null = null;

  private state: ControlState = ControlState.None;

  private rotateStart = new Vector2();

  private rotateEnd = new Vector2();

  private rotateDelta = new Vector2();

  private panStart = new Vector2();

  private panEnd = new Vector2();

  private panDelta = new Vector2();

  private dollyStart = new Vector2();

  private dollyEnd = new Vector2();

  private dollyDelta = new Vector2();

  private scale = 1;

  private zoomChanged = false;

  private pointers: PointerEvent[] = [];

  private pointerPositions: Record<number, Vector2> = {};

  private offset = new Vector3();

  private position = new Vector3();

  // so camera.up is the orbit axis
  private quat = new Quaternion();

  private quatInverse = new Quaternion();

  private lastPosition = new Vector3();

  private lastQuaternion = new Quaternion();

  private get hasCamera(): boolean {
    return this.camera !== null;
  }

  constructor(surface: HTMLElement) {
    super();

    this.domElement = surface;
    this.domElement.style.touchAction = 'none'; // disable touch scroll
  }

  public active(): void {
    this.camera = this.node.getComponentByType(PERSPECTIVE_CAMERA_COMPONENT_TYPE);
    this.cameraType = CameraType.Perspective;

    if (!this.camera) {
      this.camera = this.node.getComponentByType(ORTHOGRAPHIC_CAMERA_COMPONENT_TYPE);
      this.cameraType = CameraType.Orthographic;
    }

    if (!this.camera) {
      console.warn('Node needs to have Camera component attached');
    }

    this.enableZoom = this.hasCamera;
    this.enableRotate = this.hasCamera;
    this.enablePan = this.hasCamera;

    // Mouse buttons
    this.mouseButtons = {
      left: MouseGesture.Rotate,
      middle: MouseGesture.Dolly,
      right: MouseGesture.Pan,
    };

    // Touch fingers
    this.touches = {
      one: TouchGesture.Rotate,
      two: TouchGesture.DollyPan,
    };

    // The four arrow keys
    this.keys = {
      left: 'ArrowLeft',
      up: 'ArrowUp',
      right: 'ArrowRight',
      bottom: 'ArrowDown',
    };

    // for reset
    this.originalTarget.copy(this.target);
    this.originalPosition.copy(this.node.position);
    this.originalZoom = this.camera?.zoom || 1;

    // so camera.up is the orbit axis
    this.quat = new Quaternion().setFromUnitVectors(this.node.up, new Vector3(0, 1, 0));
    this.quatInverse = this.quat.clone().invert();

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    this.domElement.addEventListener('contextmenu', this.onContextMenu);
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointercancel', this.onPointerCancel);
    this.domElement.addEventListener('wheel', this.onMouseWheel, { passive: false });
  }

  public inactive(): void {
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointercancel', this.onPointerCancel);
    this.domElement.removeEventListener('wheel', this.onMouseWheel);
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.removeEventListener('pointerup', this.onPointerUp);

    if (this.keyEventsDom !== null) {
      this.keyEventsDom.removeEventListener('keydown', this.onKeyDown);
    }
  }

  public listenToKeyEvents(surface: HTMLElement): void {
    surface.addEventListener('keydown', this.onKeyDown);
    this.keyEventsDom = surface;
  }

  public saveState() {
    this.originalTarget.copy(this.target);
    this.originalPosition.copy(this.node.position);
    this.originalZoom = this.camera?.zoom || 1;
  }

  public reset(): void {
    this.target.copy(this.originalTarget);
    this.node.setPosition(this.originalPosition);

    if (this.camera) {
      this.camera.zoom = this.originalZoom;
      this.camera.updateProjectionMatrix();
    }

    this.emit('change');
    this.state = ControlState.None;
  }

  public getPolarAngle(): number {
    return this.spherical.phi;
  }

  public getAzimuthalAngle(): number {
    return this.spherical.theta;
  }

  public getDistance(): number {
    return this.node.position.distanceTo(this.target);
  }

  public update(): void {
    const node = this.node;
    this.position.copy(node.position);
    this.offset.copy(this.position).sub(this.target);

    // rotate offset to "y-axis-is-up" space
    this.offset.applyQuaternion(this.quat);

    // angle from z-axis around y-axis
    this.spherical.setFromVector3(this.offset);

    if (this.autoRotate && this.state === ControlState.None) {
      this.rotateLeft(this.getAutoRotationAngle());
    }

    if (this.enableDamping) {
      this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
      this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;
    } else {
      this.spherical.theta += this.sphericalDelta.theta;
      this.spherical.phi += this.sphericalDelta.phi;
    }

    // restrict theta to be between desired limits
    let min = this.minAzimuthAngle;
    let max = this.maxAzimuthAngle;

    if (Number.isFinite(min) && Number.isFinite(max)) {
      if (min < -Math.PI) min += TWO_PI; else if (min > Math.PI) min -= TWO_PI;

      if (max < -Math.PI) max += TWO_PI; else if (max > Math.PI) max -= TWO_PI;

      if (min <= max) {
        this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta));
      } else {
        this.spherical.theta = (this.spherical.theta > (min + max) / 2)
          ? Math.max(min, this.spherical.theta) : Math.min(max, this.spherical.theta);
      }
    }

    // restrict phi to be between desired limits
    this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
    this.spherical.makeSafe();
    this.spherical.radius *= this.scale;
    // restrict radius to be between desired limits
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

    // move target to panned location
    if (this.enableDamping) {
      this.target.addScaledVector(this.panOffset, this.dampingFactor);
    } else {
      this.target.add(this.panOffset);
    }

    this.offset.setFromSpherical(this.spherical);

    // rotate offset back to "camera-up-vector-is-up" space
    this.offset.applyQuaternion(this.quatInverse);

    this.position.copy(this.target).add(this.offset);
    node.setPosition(this.position);
    node.setLookAt(this.target);

    if (this.enableDamping === true) {
      this.sphericalDelta.theta *= (1 - this.dampingFactor);
      this.sphericalDelta.phi *= (1 - this.dampingFactor);
      this.panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      this.sphericalDelta.set(0, 0, 0);
      this.panOffset.set(0, 0, 0);
    }

    this.scale = 1;

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if (this.zoomChanged
      || this.lastPosition.distanceToSquared(node.position) > EPS
      || 8 * (1 - this.lastQuaternion.dot(node.quaternion)) > EPS
    ) {
      this.emit('change');
      this.lastPosition.copy(node.position);
      this.lastQuaternion.copy(node.quaternion);
      this.zoomChanged = false;
    }
  }

  private trackPointer(event: PointerEvent): void {
    let position = this.pointerPositions[event.pointerId];

    if (!position) {
      position = new Vector2();
      this.pointerPositions[event.pointerId] = position;
    }

    position.set(event.pageX, event.pageY);
  }

  private onPointerDown(event: PointerEvent): void {
    if (this.enabled === false) {
      return;
    }

    if (this.pointers.length === 0) {
      this.domElement.setPointerCapture(event.pointerId);
      this.domElement.addEventListener('pointermove', this.onPointerMove);
      this.domElement.addEventListener('pointerup', this.onPointerUp);
    }

    this.addPointer(event);

    if (event.pointerType === 'touch') {
      this.onTouchStart(event);
    } else {
      this.onMouseDown(event);
    }
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.enabled === false) return;

    if (event.pointerType === 'touch') {
      this.onTouchMove(event);
    } else {
      this.onMouseMove(event);
    }
  }

  private onPointerUp(event: PointerEvent): void {
    this.removePointer(event);

    if (this.pointers.length === 0) {
      this.domElement.releasePointerCapture(event.pointerId);
      this.domElement.removeEventListener('pointermove', this.onPointerMove);
      this.domElement.removeEventListener('pointerup', this.onPointerUp);
    }

    this.emit('end');
    this.state = ControlState.None;
  }

  private onPointerCancel(event: PointerEvent): void {
    this.removePointer(event);
  }

  private onContextMenu(event: MouseEvent): void {
    if (!this.enabled) {
      return;
    }

    event.preventDefault();
  }

  private onMouseWheel(event: WheelEvent): void {
    if (!this.enabled || !this.enableZoom || this.state !== ControlState.None) {
      return;
    }

    event.preventDefault();
    this.emit('start');
    this.handleMouseWheel(event);
    this.emit('end');
  }

  private removePointer(event: PointerEvent): void {
    delete this.pointerPositions[event.pointerId];

    for (let i = 0; i < this.pointers.length; i += 1) {
      if (this.pointers[i].pointerId === event.pointerId) {
        this.pointers.splice(i, 1);
        return;
      }
    }
  }

  private onMouseMove(event: PointerEvent): void {
    switch (this.state) {
      case ControlState.Rotate:
        if (this.enableRotate) {
          this.handleMouseMoveRotate(event);
        }
        break;

      case ControlState.Dolly:
        if (this.enableZoom) {
          this.handleMouseMoveDolly(event);
        }
        break;

      case ControlState.Pan:
        if (this.enablePan) {
          this.handleMouseMovePan(event);
        }
        break;

      default:
    }
  }

  private addPointer(event: PointerEvent): void {
    this.pointers.push(event);
  }

  private getSecondPointerPosition(event: PointerEvent): Vector2 {
    const pointer = (event.pointerId === this.pointers[0].pointerId) ? this.pointers[1] : this.pointers[0];
    return this.pointerPositions[pointer.pointerId];
  }

  private onMouseDown(event: PointerEvent): void {
    let mouseAction;

    switch (event.button) {
      case 0:
        mouseAction = this.mouseButtons.left;
        break;

      case 1:
        mouseAction = this.mouseButtons.middle;
        break;

      case 2:
        mouseAction = this.mouseButtons.right;
        break;

      default:
        mouseAction = -1;
    }

    switch (mouseAction) {
      case MouseGesture.Dolly:
        if (!this.enableZoom) {
          return;
        }

        this.handleMouseDownDolly(event);
        this.state = ControlState.Dolly;
        break;

      case MouseGesture.Rotate:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (!this.enablePan) {
            return;
          }

          this.handleMouseDownPan(event);
          this.state = ControlState.Pan;
        } else {
          if (!this.enableRotate) {
            return;
          }

          this.handleMouseDownRotate(event);
          this.state = ControlState.Rotate;
        }
        break;

      case MouseGesture.Pan:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (!this.enableRotate) {
            return;
          }

          this.handleMouseDownRotate(event);
          this.state = ControlState.Rotate;
        } else {
          if (!this.enablePan) {
            return;
          }

          this.handleMouseDownPan(event);
          this.state = ControlState.Pan;
        }

        break;

      default:
        this.state = ControlState.None;
    }

    if (this.state !== ControlState.None) {
      this.emit('start');
    }
  }

  private onTouchStart(event: PointerEvent): void {
    this.trackPointer(event);

    switch (this.pointers.length) {
      case 1:
        switch (this.touches.one) {
          case TouchGesture.Rotate:
            if (!this.enableRotate) {
              return;
            }
            this.handleTouchStartRotate();
            this.state = ControlState.TouchRotate;
            break;

          case TouchGesture.Pan:
            if (!this.enablePan) {
              return;
            }

            this.handleTouchStartPan();
            this.state = ControlState.TouchPan;
            break;

          default:
            this.state = ControlState.None;
        }
        break;

      case 2:
        switch (this.touches.two) {
          case TouchGesture.DollyPan:
            if (!this.enableZoom && !this.enablePan) {
              return;
            }

            this.handleTouchStartDollyPan();
            this.state = ControlState.TouchDollyPan;
            break;

          case TouchGesture.DollyRotate:
            if (!this.enableZoom && !this.enableRotate) {
              return;
            }

            this.handleTouchStartDollyRotate();
            this.state = ControlState.TouchDollyRotate;
            break;

          default:
            this.state = ControlState.None;
        }
        break;

      default:
        this.state = ControlState.None;
    }

    if (this.state !== ControlState.None) {
      this.emit('start');
    }
  }

  private onTouchMove(event: PointerEvent): void {
    this.trackPointer(event);

    switch (this.state) {
      case ControlState.TouchRotate:
        if (this.enableRotate) {
          this.handleTouchMoveRotate(event);
        }
        break;

      case ControlState.TouchPan:
        if (this.enablePan) {
          this.handleTouchMovePan(event);
        }
        break;

      case ControlState.TouchDollyPan:
        if (this.enableZoom || this.enablePan) {
          this.handleTouchMoveDollyPan(event);
        }
        break;

      case ControlState.TouchDollyRotate:
        if (this.enableZoom || this.enableRotate) {
          this.handleTouchMoveDollyRotate(event);
        }
        break;

      default:
        this.state = ControlState.None;
    }
  }

  private handleMouseMoveDolly(event: PointerEvent): void {
    this.dollyEnd.set(event.clientX, event.clientY);
    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

    if (this.dollyDelta.y > 0) {
      this.dollyOut(this.getZoomScale());
    } else if (this.dollyDelta.y < 0) {
      this.dollyIn(this.getZoomScale());
    }

    this.dollyStart.copy(this.dollyEnd);
  }

  private handleMouseMovePan(event: PointerEvent): void {
    this.panEnd.set(event.clientX, event.clientY);
    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);
    this.pan(this.panDelta.x, this.panDelta.y);
    this.panStart.copy(this.panEnd);
  }

  private handleMouseWheel(event: WheelEvent): void {
    if (event.deltaY < 0) {
      this.dollyIn(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyOut(this.getZoomScale());
    }
  }

  private handleTouchStartRotate(): void {
    if (this.pointers.length === 1) {
      this.rotateStart.set(this.pointers[0].pageX, this.pointers[0].pageY);
    } else {
      const x = 0.5 * (this.pointers[0].pageX + this.pointers[1].pageX);
      const y = 0.5 * (this.pointers[0].pageY + this.pointers[1].pageY);
      this.rotateStart.set(x, y);
    }
  }

  private handleTouchStartPan(): void {
    if (this.pointers.length === 1) {
      this.panStart.set(this.pointers[0].pageX, this.pointers[0].pageY);
    } else {
      const x = 0.5 * (this.pointers[0].pageX + this.pointers[1].pageX);
      const y = 0.5 * (this.pointers[0].pageY + this.pointers[1].pageY);
      this.panStart.set(x, y);
    }
  }

  private handleTouchStartDolly(): void {
    const dx = this.pointers[0].pageX - this.pointers[1].pageX;
    const dy = this.pointers[0].pageY - this.pointers[1].pageY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    this.dollyStart.set(0, distance);
  }

  private handleTouchStartDollyPan(): void {
    if (this.enableZoom) this.handleTouchStartDolly();

    if (this.enablePan) this.handleTouchStartPan();
  }

  private handleTouchStartDollyRotate(): void {
    if (this.enableZoom) {
      this.handleTouchStartDolly();
    }

    if (this.enableRotate) {
      this.handleTouchStartRotate();
    }
  }

  private handleTouchMoveRotate(event: PointerEvent): void {
    if (this.pointers.length === 1) {
      this.rotateEnd.set(event.pageX, event.pageY);
    } else {
      const position = this.getSecondPointerPosition(event);
      this.rotateEnd.set(0.5 * (event.pageX + position.x), 0.5 * (event.pageY + position.y));
    }

    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

    const element = this.domElement;
    this.rotateLeft((TWO_PI * this.rotateDelta.x) / element.clientHeight); // yes, height
    this.rotateUp((TWO_PI * this.rotateDelta.y) / element.clientHeight);
    this.rotateStart.copy(this.rotateEnd);
  }

  private handleTouchMovePan(event: PointerEvent): void {
    if (this.pointers.length === 1) {
      this.panEnd.set(event.pageX, event.pageY);
    } else {
      const position = this.getSecondPointerPosition(event);
      this.panEnd.set(0.5 * (event.pageX + position.x), 0.5 * (event.pageY + position.y));
    }

    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);
    this.pan(this.panDelta.x, this.panDelta.y);
    this.panStart.copy(this.panEnd);
  }

  private handleTouchMoveDolly(event: PointerEvent): void {
    const position = this.getSecondPointerPosition(event);

    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.dollyEnd.set(0, distance);
    this.dollyDelta.set(0, this.dollyEnd.y / this.dollyStart.y ** this.zoomSpeed);
    this.dollyOut(this.dollyDelta.y);
    this.dollyStart.copy(this.dollyEnd);
  }

  private handleTouchMoveDollyPan(event: PointerEvent): void {
    if (this.enableZoom) {
      this.handleTouchMoveDolly(event);
    }

    if (this.enablePan) {
      this.handleTouchMovePan(event);
    }
  }

  private handleTouchMoveDollyRotate(event: PointerEvent): void {
    if (this.enableZoom) {
      this.handleTouchMoveDolly(event);
    }

    if (this.enableRotate) {
      this.handleTouchMoveRotate(event);
    }
  }

  private dollyOut(dollyScale: number): void {
    if (!this.camera) {
      return;
    }

    if (this.cameraType === CameraType.Perspective) {
      this.scale /= dollyScale;
    } else {
      this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * dollyScale));
      this.camera.updateProjectionMatrix();
      this.zoomChanged = true;
    }
  }

  private dollyIn(dollyScale: number): void {
    if (!this.camera) {
      return;
    }

    if (this.cameraType === CameraType.Perspective) {
      this.scale *= dollyScale;
    } else {
      this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom / dollyScale));
      this.camera.updateProjectionMatrix();
      this.zoomChanged = true;
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.enabled || !this.enablePan) {
      return;
    }

    this.handleKeyDown(event);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    let needsUpdate = true;

    switch (event.code) {
      case this.keys.up:
        this.pan(0, this.keyPanSpeed);
        break;

      case this.keys.bottom:
        this.pan(0, -this.keyPanSpeed);
        break;

      case this.keys.left:
        this.pan(this.keyPanSpeed, 0);
        break;

      case this.keys.right:
        this.pan(-this.keyPanSpeed, 0);
        break;

      default:
        needsUpdate = false;
    }

    if (needsUpdate) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault();
    }
  }

  private handleMouseDownRotate(event: PointerEvent): void {
    this.rotateStart.set(event.clientX, event.clientY);
  }

  private handleMouseDownDolly(event: PointerEvent): void {
    this.dollyStart.set(event.clientX, event.clientY);
  }

  private handleMouseDownPan(event: PointerEvent): void {
    this.panStart.set(event.clientX, event.clientY);
  }

  private handleMouseMoveRotate(event: PointerEvent): void {
    this.rotateEnd.set(event.clientX, event.clientY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

    const element = this.domElement;
    this.rotateLeft((TWO_PI * this.rotateDelta.x) / element.clientHeight); // yes, height
    this.rotateUp((TWO_PI * this.rotateDelta.y) / element.clientHeight);
    this.rotateStart.copy(this.rotateEnd);
  }

  private getAutoRotationAngle(): number {
    return (TWO_PI / 60 / 60) * this.autoRotateSpeed;
  }

  private getZoomScale(): number {
    return 0.95 ** this.zoomSpeed;
  }

  private rotateLeft(angle: number): void {
    this.sphericalDelta.theta -= angle;
  }

  private rotateUp(angle: number): void {
    this.sphericalDelta.phi -= angle;
  }

  private panLeft(distance: number, objectMatrix: Immutable<Matrix4>) {
    _tempVec3.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
    _tempVec3.multiplyScalar(distance);
    this.panOffset.add(_tempVec3);
  }

  private panUp(distance: number, objectMatrix: Immutable<Matrix4>) {
    if (this.screenSpacePanning === true) {
      _tempVec3.setFromMatrixColumn(objectMatrix, 1);
    } else {
      _tempVec3.setFromMatrixColumn(objectMatrix, 0);
      _tempVec3.crossVectors(this.node.up, _tempVec3);
    }

    _tempVec3.multiplyScalar(distance);
    this.panOffset.add(_tempVec3);
  }

  // deltaX and deltaY are in pixels; right and down are positive
  private pan(deltaX: number, deltaY: number): void {
    if (!this.camera) {
      return;
    }

    const element = this.domElement;

    if (this.cameraType === CameraType.Perspective) {
      const cam = this.camera as IPerspectiveCamera;

      // perspective
      let targetDistance = _tempVec3.copy(this.node.position).sub(this.target).length();

      // half of the fov ifs center to top of screen
      targetDistance *= Math.tan(((cam.fov / 2) * Math.PI) / 180.0);

      // we use only clientHeight here so aspect ratio does not distort speed
      this.panLeft((2 * deltaX * targetDistance) / element.clientHeight, this.node.matrix);
      this.panUp((2 * deltaY * targetDistance) / element.clientHeight, this.node.matrix);
    } else {
      // orthographic
      const cam = this.camera as IOrthographicCamera;
      this.panLeft((deltaX * (cam.right - cam.left)) / cam.zoom / element.clientWidth, this.node.matrix);
      this.panUp((deltaY * (cam.top - cam.bottom)) / cam.zoom / element.clientHeight, this.node.matrix);
    }
  }
}

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

export class MapController extends OrbitController {
  constructor(surface: HTMLElement) {
    super(surface);

    this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

    this.mouseButtons.left = MouseGesture.Pan;
    this.mouseButtons.right = MouseGesture.Rotate;

    this.touches.one = TouchGesture.Pan;
    this.touches.two = TouchGesture.DollyRotate;
  }
}
