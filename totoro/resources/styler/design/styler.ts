import fonts from '../fonter/fonts';
import { readFileSync } from 'fs';
import { join } from 'path';

const designsPath = join(process.cwd(), 'totoro/resources/styler/design/designs.json');
let designs;

try {
  designs = JSON.parse(readFileSync(designsPath, 'utf-8'));
} catch (err) {
  designs = {
    lines1: { type: 'separator', value: '━━━◦•●◉✿ ◖ʲ◗ʰ━━━' },
    lines2: { type: 'separator', value: '━━━✿◉ʿ━━━' },
    lines3: { type: 'separator', value: '━◦◉○━' },
    lines4: { type: 'separator', value: '━━━❖✩✩✩━━━' },
    lines5: { type: 'separator', value: '━✧✩✧━' },
    lines6: { type: 'separator', value: '━━━' },
  };
}

const designFunctions = {
  separator: (config) => (content) => content ? `${content}\n${config.value}` : '',
};

export const styler = {
  format(config, contextText) {
    if (!config.context || !config.design) {
      throw new Error('Invalid styler config: missing context or design');
    }
    const contextFont = config.context.font || 'sans';
    const contextContent = fonts[contextFont]?.(contextText) || contextText;
    const messageParts = [];
    if (config.title?.text) {
      const titleFont = config.title.font || 'bold';
      const titleText = config.title.icon ? `${config.title.icon} ➤ ${config.title.text}` : `${config.title.text}`;
      const titleContent = fonts[titleFont]?.(titleText) || titleText;
      const designFn = designs[config.design]?.type === 'separator' ? designFunctions.separator(designs[config.design]) : (content) => content;
      messageParts.push(designFn(titleContent));
    }
    if (contextContent) {
      const designFn = designs[config.design]?.type === 'separator' ? designFunctions.separator(designs[config.design]) : (content) => content;
      messageParts.push(designFn(contextContent));
    }
    return messageParts.join('\n').trim();
  },
};
