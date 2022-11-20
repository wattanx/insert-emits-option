import { Project } from "ts-morph";
import { it, describe, expect } from "vitest";
import { insertEmitsOption } from "./insertEmitsOption";

it("only one emit", () => {
  const script = `
  export default defineComponent({
    setup(props, { emit }) {
      emit('change');
    }
  })
  `;

  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  const sourceFile = project.createSourceFile("test.ts", script);

  const { emits } = insertEmitsOption(sourceFile, "");

  expect(emits).toEqual(["'change'"]);
});

it("multiple emits", () => {
  const script = `
  export default defineComponent({
    setup(props, { emit }) {
      emit('change');
      const onSave = () => {
        emit('save', 'test');
      }
    }
  })
  `;

  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  const sourceFile = project.createSourceFile("test.ts", script);

  const { emits } = insertEmitsOption(sourceFile, "");

  expect(emits).toEqual(["'change'", "'save'"]);
});

it("ctx.emit", () => {
  const script = `
  export default defineComponent({
    setup(props, ctx) {
      ctx.emit('change');
    }
  })
  `;

  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  const sourceFile = project.createSourceFile("test.ts", script);

  const { emits } = insertEmitsOption(sourceFile, "");

  expect(emits).toEqual(["'change'"]);
});

it("template emit", () => {
  const template = `
  <template>
    <div>
      <button @click="$emit('save')">SAVE</button>
      <button @click="$emit('cancel')">CANCEl</button>
    </div>
  </template>`;

  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  const sourceFile = project.createSourceFile("test.ts", "");

  const { emits } = insertEmitsOption(sourceFile, template);

  expect(emits).toEqual(["'save'", "'cancel'"]);
});

it("template emit with event props", () => {
  const template = `
  <template>
    <div>
      <button @click="$emit('save', 'test')">SAVE</button>
      <button @click="$emit('cancel')">CANCEl</button>
    </div>
  </template>`;

  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  const sourceFile = project.createSourceFile("test.ts", "");

  const { emits } = insertEmitsOption(sourceFile, template);

  expect(emits).toEqual(["'save'", "'cancel'"]);
});

it("template emit and setup emit", () => {
  const script = `
  export default defineComponent({
    setup(props, { emit }) {
      emit('change');
      const onSave = () => {
        emit('save', 'test');
      }
    }
  })
  `;

  const template = `
  <template>
    <div>
      <button @click="$emit('save', 'test')">SAVE</button>
      <button @click="$emit('cancel')">CANCEl</button>
    </div>
  </template>`;

  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  const sourceFile = project.createSourceFile("test.ts", script);

  const { emits } = insertEmitsOption(sourceFile, template);

  expect(emits).toEqual(["'change'", "'save'", "'cancel'"]);
});
