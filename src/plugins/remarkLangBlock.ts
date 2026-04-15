import { visit } from 'unist-util-visit';

/**
 * remark 插件：将 :::en / :::zh 容器转换为带 data-lang 属性的 div
 */
export function remarkLangBlock() {
  return (tree: any) => {
    visit(tree, 'containerDirective', (node: any) => {
      const lang = node.name;
      if (lang === 'en' || lang === 'zh') {
        node.data = node.data || {};
        node.data.hName = 'div';
        node.data.hProperties = {
          className: 'lang-block',
          'data-lang': lang,
        };
      }
    });
  };
}