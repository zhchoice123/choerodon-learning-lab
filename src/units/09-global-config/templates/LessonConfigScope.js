// 让模板里的 import './LessonConfigScope' 在 templates/ 和单元目录下都能解析：
// 模板被 yarn unit:reset 或页面「重置」复制成 ../Exercise.js 后，同一行 import 指向真正的实现。
export { default, enterConfigScope } from '../LessonConfigScope';
