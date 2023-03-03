import { defs, tiny } from "./examples/common.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Shader,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
} = tiny;

export class GameObject {
  constructor(baseTransform) {
    this.baseTransform = baseTransform;
    this.children = [];
  }

  getBaseTransform() {
    return this.baseTransform;
  }

  setBaseTransform(transform) {
    this.baseTransform = transform;
  }

  update(program_state) {
    for (let child of this.children) {
      child.update(program_state);
    }
  }

  draw(context, program_state, model_transform) {
    for (let child of this.children) {
      child.draw(context, program_state, model_transform);
    }
  }
}

const shapes = {
  square: new defs.Square(),
  trapezoidalPrism:
    new (defs.Capped_Cylinder.prototype.make_flat_shaded_version())(10, 10, [
      [0, 2],
      [0, 2],
    ]),
  sphere: new defs.Subdivision_Sphere(8),
  triangle: new defs.Cone_Tip(10, 10),
  torus: new defs.Torus(16, 16),
};

const phong_material = new Material(new defs.Phong_Shader());

const groundRotation = Mat4.rotation((Math.PI * 2) / 3, 1, 0, 0);
const invertedGroundRotation = Mat4.inverse(groundRotation);

export class Player extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
  }

  draw(context, program_state, model_transform) {
    shapes.sphere.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.scale(1.5, 1.5, 1.5)),
      phong_material.override({
        ambient: 0.9,
        diffusivity: 0.0,
        color: hex_color("#DD571C"),
      })
    );

    shapes.triangle.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(2, 1, 5)),
      phong_material.override({
        ambient: 0.9,
        diffusivity: 0.0,
        color: hex_color("#DD571C"),
      })
    );

    shapes.triangle.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.rotation(-Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(2, 1, 5)),
      phong_material.override({
        ambient: 0.9,
        diffusivity: 0.0,
        color: hex_color("#DD571C"),
      })
    );
  }
}
export class Ring extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
  }
  draw(context, program_state, model_transform) {
    shapes.torus.draw(context, program_state, model_transform.times(this.baseTransform), phong_material.override({
      ambient: 0.4,
      diffusivity: 0.6,
      color: hex_color("#FF0000"),
    }))
  }

}


export class Rock extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
    this.randomOffsetX = Math.random() * 205;
    this.randomScaling = Math.random() * 1.5 + 0.5;
  }
}

export class Tree extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
    this.rockRandomOffsetX = Math.random() * 205;
    this.rockRandomScaling = Math.random() * 1.5 + 0.5;
  }
  draw(context, program_state, model_transform) {
    // rocks
    shapes.trapezoidalPrism.draw(
      context,
      program_state,
      model_transform
        .times(Mat4.translation(0 + this.rockRandomOffsetX, -1.5, 5.5))
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.scale(5, 3, 5.5))
        .times(
          Mat4.scale(
            this.rockRandomScaling,
            this.rockRandomScaling,
            this.rockRandomScaling
          )
        ),
      phong_material.override({
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#7F8386"),
      })
    );

    const TREE_HEIGHT = 10;
    shapes.trapezoidalPrism.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.scale(1, TREE_HEIGHT, 1)),
      phong_material.override({
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#964B00"),
      })
    );

    // position of this might be centered? so needs to scale more?
    //tree leaves
    shapes.trapezoidalPrism.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(
          Mat4.translation(0, 10, 0).times(Mat4.scale(1.5, TREE_HEIGHT, 1.5))
        ),
      phong_material.override({
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#2C493F"),
      })
    );
  }
}

export class Ground extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 400 - 200;
      const y = Math.random() * 400;
      const z = -5;
      this.children.push(new Tree(Mat4.translation(x, y, z)));
    }
  }

  draw(context, program_state, model_transform) {
    shapes.square.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(groundRotation.times(Mat4.scale(1000, 1000, 1))),
      phong_material.override({
        ambient: 0.85,
        diffusivity: 0.6,
        color: hex_color("#F4F5E2"),
      })
    );

    for (let tree of this.children) {
      tree.draw(
        context,
        program_state,
        model_transform.times(this.getBaseTransform()).times(groundRotation)
      );
    }
  }
}
