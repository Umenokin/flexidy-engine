/* eslint-disable no-mixed-operators */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-use-before-define */

import {
  IEntity,
  Vector2,
  Vector3,
  Spherical,
  Quaternion,
  MouseGesture,
  TouchGesture,
  IOrthographicCamera,
  IPerspectiveCamera,
  ORTHOGRAPHIC_CAMERA_COMPONENT_TYPE,
  PERSPECTIVE_CAMERA_COMPONENT_TYPE,
  Immutable,
} from 'flexidy-engine';
import { Matrix4 } from 'flexidy-engine/math/matrix4';

import { EventDispatcher } from 'three';

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
  bottom: 'ArrowDown'
};

enum CameraType {
  Perspective = 0,
  Orthographic = 1,
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

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

const _tempVec3 = new Vector3();

class OrbitControls extends EventDispatcher {
  private entity: IEntity;

  private camera: IOrthographicCamera|IPerspectiveCamera;

  private cameraType: CameraType;

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
  protected enableZoom = true;

  protected zoomSpeed = 1.0;

  // Set to false to disable rotating
  protected enableRotate = true;

  protected rotateSpeed = 1.0;

  // Set to false to disable panning
  protected enablePan = true;

  protected panSpeed = 1.0;

  protected screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up

  protected keyPanSpeed = 7.0; // pixels moved per arrow key push

  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  protected autoRotate = false;

  protected autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

  protected mouseButtons: MouseButtons;

  protected touches: Touches;

  protected keys: ControlKeys;

  protected originalTarget: Vector3;

  protected originalPosition: Vector3;

  protected originalZoom: number;

      // current position in spherical coordinates
  private spherical = new Spherical();

  private sphericalDelta = new Spherical();

  private panOffset = new Vector3();

  // the target DOM element for key events
  private keyEventsDom: HTMLElement|null = null;

  private state: ControlState = ControlState.None;

  constructor(
    entity: IEntity, surface: HTMLElement) {
    super();

    this.entity = entity;
    this.domElement = surface;
    this.domElement.style.touchAction = 'none'; // disable touch scroll

    let camera: IPerspectiveCamera|IOrthographicCamera|null = entity.getComponentByType(PERSPECTIVE_CAMERA_COMPONENT_TYPE);
    this.cameraType = CameraType.Perspective;
    if (!camera) {
      camera = entity.getComponentByType(ORTHOGRAPHIC_CAMERA_COMPONENT_TYPE);
      this.cameraType = CameraType.Orthographic;
    }
    if (!camera) {
      throw new Error('Provided entity needs to have Camera component attached');
    }

    this.camera = camera;

    // The four arrow keys
    this.keys = {
      left: 'ArrowLeft',
      up: 'ArrowUp',
      right: 'ArrowRight',
      bottom: 'ArrowDown',
    };

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

    // for reset
    this.originalTarget = this.target.clone();
    this.originalPosition = this.entity.position.clone();
    this.originalZoom = this.camera.zoom;

    this.onKeyDown = this.onKeyDown.bind(this);

    //
    // public methods
    //

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = (function () {
      const offset = new Vector3();
      const position = new Vector3();

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(entity.up, new Vector3(0, 1, 0));
      const quatInverse = quat.clone().invert();

      const lastPosition = new Vector3();
      const lastQuaternion = new Quaternion();

      const twoPI = 2 * Math.PI;

      return function update() {
        position.copy(scope.entity.position);

        offset.copy(position).sub(scope.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        scope.spherical.setFromVector3(offset);

        if (scope.autoRotate && scope.state === ControlState.None) {
          scope.rotateLeft(scope.getAutoRotationAngle());
        }

        if (scope.enableDamping) {
          scope.spherical.theta += scope.sphericalDelta.theta * scope.dampingFactor;
          scope.spherical.phi += scope.sphericalDelta.phi * scope.dampingFactor;
        } else {
          scope.spherical.theta += scope.sphericalDelta.theta;
          scope.spherical.phi += scope.sphericalDelta.phi;
        }

        // restrict theta to be between desired limits

        let min = scope.minAzimuthAngle;
        let max = scope.maxAzimuthAngle;

        if (Number.isFinite(min) && Number.isFinite(max)) {
          if (min < -Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;

          if (max < -Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

          if (min <= max) {
            scope.spherical.theta = Math.max(min, Math.min(max, scope.spherical.theta));
          } else {
            scope.spherical.theta = (scope.spherical.theta > (min + max) / 2)
            ? Math.max(min, scope.spherical.theta)
            : Math.min(max, scope.spherical.theta);
          }
        }

        // restrict phi to be between desired limits
        scope.spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, scope.spherical.phi));

        scope.spherical.makeSafe();

        scope.spherical.radius *= scale;

        // restrict radius to be between desired limits
        scope.spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, scope.spherical.radius));

        // move target to panned location

        if (scope.enableDamping === true) {
          scope.target.addScaledVector(scope.panOffset, scope.dampingFactor);
        } else {
          scope.target.add(scope.panOffset);
        }

        offset.setFromSpherical(scope.spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(scope.target).add(offset);
        scope.entity.position = position;

        scope.entity.lookAt = scope.target;

        if (scope.enableDamping === true) {
          scope.sphericalDelta.theta *= (1 - scope.dampingFactor);
          scope.sphericalDelta.phi *= (1 - scope.dampingFactor);

          scope.panOffset.multiplyScalar(1 - scope.dampingFactor);
        } else {
          scope.sphericalDelta.set(0, 0, 0);

          scope.panOffset.set(0, 0, 0);
        }

        scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (zoomChanged
          || lastPosition.distanceToSquared(scope.entity.position) > EPS
          || 8 * (1 - lastQuaternion.dot(scope.entity.quaternion)) > EPS) {
          scope.dispatchEvent(_changeEvent);

          lastPosition.copy(scope.entity.position);
          lastQuaternion.copy(scope.entity.quaternion);
          zoomChanged = false;

          return true;
        }

        return false;
      };
    }());

    this.dispose = function () {
      scope.domElement.removeEventListener('contextmenu', onContextMenu);

      scope.domElement.removeEventListener('pointerdown', onPointerDown);
      scope.domElement.removeEventListener('pointercancel', onPointerCancel);
      scope.domElement.removeEventListener('wheel', onMouseWheel);

      scope.domElement.removeEventListener('pointermove', onPointerMove);
      scope.domElement.removeEventListener('pointerup', onPointerUp);

      if (scope.keyEventsDom !== null) {
        scope.keyEventsDom.removeEventListener('keydown', this.onKeyDown);
      }

      // scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    };

    //
    // internals
    //

    const scope = this;

    const EPS = 0.000001;

    let scale = 1;
    let zoomChanged = false;

    const rotateStart = new Vector2();
    const rotateEnd = new Vector2();
    const rotateDelta = new Vector2();

    const panStart = new Vector2();
    const panEnd = new Vector2();
    const panDelta = new Vector2();

    const dollyStart = new Vector2();
    const dollyEnd = new Vector2();
    const dollyDelta = new Vector2();

    const pointers = [];
    const pointerPositions = {};

    function dollyOut(dollyScale) {
      if (scope.cameraType === CameraType.Perspective) {
        scale /= dollyScale;
      } else if (scope.cameraType === CameraType.Orthographic) {
        scope.camera.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.camera.zoom * dollyScale));
        scope.camera.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        scope.enableZoom = false;
      }
    }

    function dollyIn(dollyScale) {
      if (scope.cameraType === CameraType.Perspective) {
        scale *= dollyScale;
      } else if (scope.cameraType === CameraType.Orthographic) {
        scope.camera.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.camera.zoom / dollyScale));
        scope.camera.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        scope.enableZoom = false;
      }
    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event) {
      rotateStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownDolly(event) {
      dollyStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownPan(event) {
      panStart.set(event.clientX, event.clientY);
    }

    function handleMouseMoveRotate(event) {
      rotateEnd.set(event.clientX, event.clientY);

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

      const element = scope.domElement;

      scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

      scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

      rotateStart.copy(rotateEnd);

      scope.update();
    }

    function handleMouseMoveDolly(event) {
      dollyEnd.set(event.clientX, event.clientY);

      dollyDelta.subVectors(dollyEnd, dollyStart);

      if (dollyDelta.y > 0) {
        dollyOut(scope.getZoomScale());
      } else if (dollyDelta.y < 0) {
        dollyIn(scope.getZoomScale());
      }

      dollyStart.copy(dollyEnd);

      scope.update();
    }

    function handleMouseMovePan(event) {
      panEnd.set(event.clientX, event.clientY);

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

      scope.pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);

      scope.update();
    }

    function handleMouseWheel(event) {
      if (event.deltaY < 0) {
        dollyIn(scope.getZoomScale());
      } else if (event.deltaY > 0) {
        dollyOut(scope.getZoomScale());
      }

      scope.update();
    }

    function handleTouchStartRotate() {
      if (pointers.length === 1) {
        rotateStart.set(pointers[0].pageX, pointers[0].pageY);
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

        rotateStart.set(x, y);
      }
    }

    function handleTouchStartPan() {
      if (pointers.length === 1) {
        panStart.set(pointers[0].pageX, pointers[0].pageY);
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

        panStart.set(x, y);
      }
    }

    function handleTouchStartDolly() {
      const dx = pointers[0].pageX - pointers[1].pageX;
      const dy = pointers[0].pageY - pointers[1].pageY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyStart.set(0, distance);
    }

    function handleTouchStartDollyPan() {
      if (scope.enableZoom) handleTouchStartDolly();

      if (scope.enablePan) handleTouchStartPan();
    }

    function handleTouchStartDollyRotate() {
      if (scope.enableZoom) handleTouchStartDolly();

      if (scope.enableRotate) handleTouchStartRotate();
    }

    function handleTouchMoveRotate(event) {
      if (pointers.length === 1) {
        rotateEnd.set(event.pageX, event.pageY);
      } else {
        const position = getSecondPointerPosition(event);

        const x = 0.5 * (event.pageX + position.x);
        const y = 0.5 * (event.pageY + position.y);

        rotateEnd.set(x, y);
      }

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

      const element = scope.domElement;

      scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

      scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

      rotateStart.copy(rotateEnd);
    }

    function handleTouchMovePan(event) {
      if (pointers.length === 1) {
        panEnd.set(event.pageX, event.pageY);
      } else {
        const position = getSecondPointerPosition(event);

        const x = 0.5 * (event.pageX + position.x);
        const y = 0.5 * (event.pageY + position.y);

        panEnd.set(x, y);
      }

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

      scope.pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);
    }

    function handleTouchMoveDolly(event) {
      const position = getSecondPointerPosition(event);

      const dx = event.pageX - position.x;
      const dy = event.pageY - position.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyEnd.set(0, distance);

      dollyDelta.set(0, dollyEnd.y / dollyStart.y ** scope.zoomSpeed);

      dollyOut(dollyDelta.y);

      dollyStart.copy(dollyEnd);
    }

    function handleTouchMoveDollyPan(event) {
      if (scope.enableZoom) handleTouchMoveDolly(event);

      if (scope.enablePan) handleTouchMovePan(event);
    }

    function handleTouchMoveDollyRotate(event) {
      if (scope.enableZoom) handleTouchMoveDolly(event);

      if (scope.enableRotate) handleTouchMoveRotate(event);
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onPointerDown(event) {
      if (scope.enabled === false) return;

      if (pointers.length === 0) {
        scope.domElement.setPointerCapture(event.pointerId);

        scope.domElement.addEventListener('pointermove', onPointerMove);
        scope.domElement.addEventListener('pointerup', onPointerUp);
      }

      //

      addPointer(event);

      if (event.pointerType === 'touch') {
        onTouchStart(event);
      } else {
        onMouseDown(event);
      }
    }

    function onPointerMove(event) {
      if (scope.enabled === false) return;

      if (event.pointerType === 'touch') {
        onTouchMove(event);
      } else {
        onMouseMove(event);
      }
    }

    function onPointerUp(event) {
        removePointer(event);

        if (pointers.length === 0) {
            scope.domElement.releasePointerCapture(event.pointerId);

            scope.domElement.removeEventListener('pointermove', onPointerMove);
            scope.domElement.removeEventListener('pointerup', onPointerUp);
        }

        scope.dispatchEvent(_endEvent);

        scope.state = ControlState.None;
    }

    function onPointerCancel(event) {
      removePointer(event);
    }

    function onMouseDown(event) {
      let mouseAction;

      switch (event.button) {
        case 0:
          mouseAction = scope.mouseButtons.left;
          break;

        case 1:
          mouseAction = scope.mouseButtons.middle;
          break;

        case 2:
          mouseAction = scope.mouseButtons.right;
          break;

        default:

          mouseAction = -1;
      }

      switch (mouseAction) {
        case MouseGesture.Dolly:
          if (scope.enableZoom === false) {
            return;
          }

          handleMouseDownDolly(event);
          scope.state = ControlState.Dolly;
          break;

        case MouseGesture.Rotate:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enablePan === false) {
              return;
            }

            handleMouseDownPan(event);
            scope.state = ControlState.Pan;
          } else {
            if (scope.enableRotate === false) {
              return;
            }

            handleMouseDownRotate(event);
            scope.state = ControlState.Rotate;
          }

          break;

        case MouseGesture.Pan:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enableRotate === false) {
              return;
            }

            handleMouseDownRotate(event);
            scope.state = ControlState.Rotate;
          } else {
            if (scope.enablePan === false) {
              return;
            }

            handleMouseDownPan(event);
            scope.state = ControlState.Pan;
          }

          break;

        default:

          scope.state = ControlState.None;
      }

      if (scope.state !== ControlState.None) {
        scope.dispatchEvent(_startEvent);
      }
    }

    function onMouseMove(event) {
      switch (scope.state) {
        case ControlState.Rotate:
          if (scope.enableRotate === false) {
            return;
          }

          handleMouseMoveRotate(event);
          break;

        case ControlState.Dolly:
          if (scope.enableZoom === false) {
            return;
          }

          handleMouseMoveDolly(event);
          break;

        case ControlState.Pan:
          if (scope.enablePan === false) {
            return;
          }

          handleMouseMovePan(event);
          break;

        default:
      }
    }

    function onMouseWheel(event) {
      if (scope.enabled === false || scope.enableZoom === false || scope.state !== ControlState.None) return;

      event.preventDefault();

      scope.dispatchEvent(_startEvent);

      handleMouseWheel(event);

      scope.dispatchEvent(_endEvent);
    }

    function onTouchStart(event) {
      trackPointer(event);

      switch (pointers.length) {
        case 1:

          switch (scope.touches.one) {
            case TouchGesture.Rotate:
              if (scope.enableRotate === false) {
                return;
              }
              handleTouchStartRotate();
              scope.state = ControlState.TouchRotate;
              break;

            case TouchGesture.Pan:
              if (scope.enablePan === false) {
                return;
              }

              handleTouchStartPan();
              scope.state = ControlState.TouchPan;
              break;

            default:
              scope.state = ControlState.None;
          }

          break;

        case 2:

          switch (scope.touches.two) {
            case TouchGesture.DollyPan:
              if (scope.enableZoom === false && scope.enablePan === false) {
                return;
              }

              handleTouchStartDollyPan();
              scope.state = ControlState.TouchDollyPan;
              break;

            case TouchGesture.DollyRotate:
              if (scope.enableZoom === false && scope.enableRotate === false) {
                return;
              }

              handleTouchStartDollyRotate();
              scope.state = ControlState.TouchDollyRotate;
              break;

            default:
              scope.state = ControlState.None;
          }

          break;

        default:
          scope.state = ControlState.None;
      }

      if (scope.state !== ControlState.None) {
        scope.dispatchEvent(_startEvent);
      }
    }

    function onTouchMove(event) {
      trackPointer(event);

      switch (scope.state) {
        case ControlState.TouchRotate:
          if (scope.enableRotate === false) {
            return;
          }

          handleTouchMoveRotate(event);
          scope.update();
          break;

        case ControlState.TouchPan:
          if (scope.enablePan === false) {
            return;
          }

          handleTouchMovePan(event);
          scope.update();
          break;

        case ControlState.TouchDollyPan:
          if (scope.enableZoom === false && scope.enablePan === false) {
            return;
          }

          handleTouchMoveDollyPan(event);
          scope.update();
          break;

        case ControlState.TouchDollyRotate:
          if (scope.enableZoom === false && scope.enableRotate === false) {
            return;
          }

          handleTouchMoveDollyRotate(event);
          scope.update();
          break;

        default:
          scope.state = ControlState.None;
      }
    }

    function onContextMenu(event) {
      if (scope.enabled === false) return;

      event.preventDefault();
    }

    function addPointer(event) {
      pointers.push(event);
    }

    function removePointer(event) {
      delete pointerPositions[event.pointerId];

      for (let i = 0; i < pointers.length; i += 1) {
        if (pointers[i].pointerId === event.pointerId) {
          pointers.splice(i, 1);
          return;
        }
      }
    }

    function trackPointer(event) {
      let position = pointerPositions[event.pointerId];

      if (position === undefined) {
        position = new Vector2();
        pointerPositions[event.pointerId] = position;
      }

      position.set(event.pageX, event.pageY);
    }

    function getSecondPointerPosition(event) {
      const pointer = (event.pointerId === pointers[0].pointerId) ? pointers[1] : pointers[0];

      return pointerPositions[pointer.pointerId];
    }

    //

    scope.domElement.addEventListener('contextmenu', onContextMenu);

    scope.domElement.addEventListener('pointerdown', onPointerDown);
    scope.domElement.addEventListener('pointercancel', onPointerCancel);
    scope.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

    // force an update at start

    this.update();
  }

  public listenToKeyEvents(surface: HTMLElement): void {
    surface.addEventListener('keydown', this.onKeyDown);
    this.keyEventsDom = surface;
  }

  public saveState() {
    this.originalTarget.copy(this.target);
    this.originalPosition.copy(this.entity.position);
    this.originalZoom = this.camera.zoom;
  }

  public reset(): void {
    this.target.copy(this.originalTarget);
    this.entity.position.copy(this.originalPosition);
    this.camera.zoom = this.originalZoom;

    this.camera.updateProjectionMatrix();
    this.dispatchEvent(_changeEvent);

    this.update();

    this.state = ControlState.None;
  }

  public getPolarAngle(): number {
    return this.spherical.phi;
  }

  public getAzimuthalAngle(): number {
    return this.spherical.theta;
  }

  public getDistance(): number {
    return this.entity.position.distanceTo(this.target);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (this.enabled === false || this.enablePan === false) {
      return;
    }

    this.handleKeyDown(event);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    let needsUpdate = false;

    switch (event.code) {
      case this.keys.up:
        this.pan(0, this.keyPanSpeed);
        needsUpdate = true;
        break;

      case this.keys.bottom:
        this.pan(0, -this.keyPanSpeed);
        needsUpdate = true;
        break;

      case this.keys.left:
        this.pan(this.keyPanSpeed, 0);
        needsUpdate = true;
        break;

      case this.keys.right:
        this.pan(-this.keyPanSpeed, 0);
        needsUpdate = true;
        break;

      default:
    }

    if (needsUpdate) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault();
      this.update();
    }
  }

  private getAutoRotationAngle(): number {
    return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
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
      _tempVec3.crossVectors(this.entity.up, _tempVec3);
    }

    _tempVec3.multiplyScalar(distance);

    this.panOffset.add(_tempVec3);
  }

  // deltaX and deltaY are in pixels; right and down are positive
  private pan(deltaX: number, deltaY: number): void {
    const element = this.domElement;

    if (this.cameraType === CameraType.Perspective) {
      const cam = this.camera as IPerspectiveCamera;

      // perspective
      const position = this.entity.position;
      _tempVec3.copy(position).sub(this.target);
      let targetDistance = _tempVec3.length();

      // half of the fov ifs center to top of screen
      targetDistance *= Math.tan((cam.fov / 2) * Math.PI / 180.0);

      // we use only clientHeight here so aspect ratio does not distort speed
      this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.entity.matrix);
      this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.entity.matrix);
    } else if (this.cameraType === CameraType.Orthographic) {
      // orthographic
      const cam = this.camera as IOrthographicCamera;
      this.panLeft(deltaX * (cam.right - cam.left) / cam.zoom / element.clientWidth, this.entity.matrix);
      this.panUp(deltaY * (cam.top - cam.bottom) / cam.zoom / element.clientHeight, this.entity.matrix);
    } else {
      // camera neither orthographic nor perspective
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
      this.enablePan = false;
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

class MapControls extends OrbitControls {
  constructor(entity: IEntity, surface: HTMLElement) {
    super(entity, surface);

    this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

    this.mouseButtons.left = MouseGesture.Pan;
    this.mouseButtons.right = MouseGesture.Rotate;

    this.touches.one = TouchGesture.Pan;
    this.touches.two = TouchGesture.DollyRotate;
  }
}

export { OrbitControls, MapControls };
