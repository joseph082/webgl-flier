import { defs, tiny } from "./examples/common.js";
import { Shadow_Textured_Phong_Shader } from "./examples/shadow-demo-shader.js";

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

  Texture,
  Textured_Phong,
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

  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_buffer
  ) {
    for (let child of this.children) {
      child.draw(
        context,
        program_state,
        model_transform,
        material_override,
        light_depth_buffer
      );
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
  cube: new defs.Cube(),
};

const phong_material = new Material(new Shadow_Textured_Phong_Shader(1));
const rockTexture = new Material(new Shadow_Textured_Phong_Shader(1), {
  // color: hex_color("#7F8386"), // <-- changed base color to black
  ambient: 0.6, // <-- changed ambient to 1
  diffusivity: 0.6, // <-- changed ambient to 1
  // color_texture: new Texture("assets/rock_texture.jpg"),
  color: hex_color("#AAAAAA"),
  smoothness: 64,
  specularity: 0.4,
  light_depth_texture: null,
});
const snowTexture = new Material(new Shadow_Textured_Phong_Shader(1), {
  ambient: 0.6, // <-- changed ambient to 1
  diffusivity: 0.6, // <-- changed ambient to 1
  // color_texture: new Texture("assets/Snow004_1K_Color.jpg"),
  color: hex_color("#FFFFFF"),
  smoothness: 64,
  specularity: 0.4,
  light_depth_texture: null,
});

const groundRotation = Mat4.rotation((Math.PI * 2) / 3, 1, 0, 0);
const invertedGroundRotation = Mat4.inverse(groundRotation);

export class Player extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);

    this.wingsuitOrange = hex_color("#DD571C");
  }

  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_buffer
  ) {
    shapes.sphere.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.scale(1.5, 1.5, 1.5)),
      material_override ??
        phong_material.override({
          ambient: 0.9,
          diffusivity: 0.0,
          color: this.wingsuitOrange,
          light_depth_buffer,
        })
    );

    shapes.triangle.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(2, 1, 5)),
      material_override ??
        phong_material.override({
          ambient: 0.9,
          diffusivity: 0.0,
          color: this.wingsuitOrange,
          light_depth_buffer,
        })
    );

    shapes.triangle.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.rotation(-Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(2, 1, 5)),
      material_override ??
        phong_material.override({
          ambient: 0.9,
          diffusivity: 0.0,
          color: this.wingsuitOrange,
          light_depth_buffer,
        })
    );
  }
}
export class Ring extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
  }
  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_buffer
  ) {
    shapes.torus.draw(
      context,
      program_state,
      model_transform.times(this.baseTransform),
      material_override ??
        phong_material.override({
          ambient: 0.4,
          diffusivity: 0.6,
          color: hex_color("#FF0000"),
          light_depth_buffer,
        })
    );
  }
}

export class Rock extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
    this.randomOffsetX = Math.random() * 205;
    this.randomScaling = Math.random() * 1.5 + 0.5;
  }
  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_buffer
  ) {
    // rocks
    shapes.trapezoidalPrism.draw(
      context,
      program_state,
      model_transform
        .times(Mat4.translation(0 + this.randomOffsetX, -1.5, 5.5))
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.scale(5, 3, 5.5))
        .times(
          Mat4.scale(this.randomScaling, this.randomScaling, this.randomScaling)
        ),
      material_override ??
        rockTexture.override({
          light_depth_buffer,
          //color: hex_color("#7F8386"),
        })
    );

    // shapes.cube.draw(
    //   context,
    //   program_state,
    //   model_transform
    //     .times(Mat4.translation(0 + this.randomOffsetX, -1.5, 5.5))
    //     .times(this.getBaseTransform())
    //     .times(invertedGroundRotation)
    //     .times(Mat4.scale(5, 3, 5.5))
    //     .times(
    //       Mat4.scale(this.randomScaling, this.randomScaling, this.randomScaling)
    //     ),
    //   rockTexture.override({
    //     ambient: 0.4,
    //     diffusivity: 0.0,
    //     //color: hex_color("#7F8386"),
    //   })
    // );
  }
}

export class Tree extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
    this.rockRandomOffsetX = Math.random() * 205;
    this.rockRandomScaling = Math.random() * 1.5 + 0.5;
  }
  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_buffer
  ) {
    const TREE_HEIGHT = 10;
    shapes.trapezoidalPrism.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.scale(1, TREE_HEIGHT, 1)),
      material_override ??
        phong_material.override({
          ambient: 0.4,
          diffusivity: 0.6,
          color: hex_color("#964B00"),
          light_depth_buffer,
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
      material_override ??
        phong_material.override({
          ambient: 0.4,
          diffusivity: 0.6,
          color: hex_color("#2C493F"),
          light_depth_buffer,
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
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * 400 - 200;
      const y = Math.random() * 400;
      const z = -5;
      this.children.push(new Rock(Mat4.translation(x, y, z)));
    }
  }

  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_buffer
  ) {
    shapes.square.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(groundRotation.times(Mat4.scale(1000, 1000, 1))),
      material_override ?? snowTexture.override({ light_depth_buffer })
    );

    for (let tree of this.children) {
      tree.draw(
        context,
        program_state,
        model_transform.times(this.getBaseTransform()).times(groundRotation),
        material_override,
        light_depth_buffer
      );
    }
  }
}
