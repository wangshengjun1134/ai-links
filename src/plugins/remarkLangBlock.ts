import { visit } from 'unist-util-visit';

/**
 * remark 插件：将 :::en / :::zh 容器转换为带 data-lang 属性的 div
 * 同时处理 :::zh-title / :::en-title 标题容器
 */
export function remarkLangBlock() {
  return (tree: any) => {
    visit(tree, ['containerDirective', 'leafDirective'], (node: any) => {
      const name = node.name;
      if (name === 'en' || name === 'zh') {
        node.data = node.data || {};
        node.data.hName = 'div';
        node.data.hProperties = {
          className: 'lang-block',
          'data-lang': name,
        };
      } else if (name === 'zh-title' || name === 'zhtitle') {
        node.data = node.data || {};
        node.data.hName = 'div';
        node.data.hProperties = {
          className: 'zh-title',
        };
      } else if (name === 'en-title' || name === 'entitle') {
        node.data = node.data || {};
        node.data.hName = 'div';
        node.data.hProperties = {
          className: 'en-title',
        };
      }
    });
  };
}