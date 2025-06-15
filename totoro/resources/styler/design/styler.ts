import fonts from '../fonter/fonts';

const designs = {
  lines1: (content) => content ? `${content}\n───` : '',
  border: (content) => {
    if (!content) return '';
    const lines = content.split('\n');
    const maxLength = Math.max(...lines.map(line => line.length));
    const border = '═'.repeat(maxLength + 4);
    return `╔${border}╗\n${lines.map(line => `║ ${line.padEnd(maxLength)} ║`).join('\n')}\n╚${border}╝`;
  },
  plain: (content) => content,
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
      const titleContent = fonts[titleFont]?.(config.title.text) || config.title.text;
      messageParts.push(designs[config.design]?.(titleContent) || titleContent);
    }
    if (contextContent) {
      messageParts.push(designs[config.design]?.(contextContent) || contextContent);
    }
    if (config.footer?.text) {
      const footerFont = config.footer.font || 'sans';
      const footerContent = fonts[footerFont]?.(config.footer.text) || config.footer.text;
      messageParts.push(designs[config.design]?.(footerContent) || footerContent);
    }
    return messageParts.join('\n').trim();
  },
};