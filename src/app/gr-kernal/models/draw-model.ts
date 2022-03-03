import { IRect } from "./rect-model";

/** Свойства отображения */
export interface IDrawProperties
{
  /** Левый-верхний угол отрисовки */
  left: number;
  top: number;
  /** Коэффициент масштабирования */
  scale: number;
  /** Картографический масштаб, например 1:500 mashtab = 500 */
  mashtab: number;
}
/** Данные для отображения теста */
export interface IText
{
  /** Текст вывода */
  text: string;
  /** Точка вставки по X */
  x: number;
  /** Точка вставки по Y */
  y: number;
  /** Угол поворота */
  angle: number;
  /** Описывающий прямоугольник */
  rect: IRect;
  /** Координаты прямоугольника в который вписан текст */
  coords: number[];
}

/** Результирующий слой для отображения */
export interface ILayer
{
  /** Уникальный идентификатор */
  legendId: number,
  /** Координаты для отрисовки */
  coords: number[][];
  /** Шрифт */
  font: string;
  /** Тексты */
  texts: IText[];
}

/** Данные для отображения */
export interface IObraz
{
  coords: number[];
  text?: IText;
}
