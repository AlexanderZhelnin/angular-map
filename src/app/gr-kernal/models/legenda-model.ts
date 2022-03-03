import { IPrimitive } from './primitive-model';
import { IMashtabRange } from "./mashtab-model";

/** Тип графического образа */
export enum GrTypeEnum
{
  /** Отсутствует */
  Empty = 0,
  /** Линия */
  Line = 1,
  /** Полигон */
  Polygon = 2,
  /** Условное обозначение */
  Block = 3,
  /** Кривая типа сплайн */
  Spline = 4,
  /** Кривая типа безье */
  Bezier = 5,
  /** Эллипс */
  Ellipse = 6,
  /** Сектор */
  Pie = 7,
  /** Путь(составной, может состоять из различных графических примитивов) */
  Path = 8,
  /** Замкнутый залитый путь */
  FillPath = 9,
  /** Надпись */
  Text = 10,
  /** Контрол */
  Visual = 12,
  /** Круг */
  Circle = 13
}

/** Стиль границы */
export enum BorderStyleEnum
{
  /** Простая */
  Solid = 0,
  /** Пунктирный */
  Dash = 1,
  /** Без границы */
  Transparent = 2,
  /** Текстурная */
  Textured = 3
}

/** Стиль заливки */
export enum FillStyleEnum
{
  /** Сплошная заливка */
  Solid = 1,
  /** Без заливки */
  Transparent = 2,
  /** Заливка с использованием градиентной заливки */
  LinearGradient = 3,
  /** Заливка с использованием текстуры */
  Textured = 4,
  /** Заливка с использованием штриховки */
  Hatch = 5
}

/** Ориентация для градиентной заливки */
export enum GradientStyle
{
  /** Горизонтальная - Слева на право */
  Left2Right,
  /** Горизонтальная - С право на лево */
  Right2Left,
  /** Вертикальная - Снизу вверх */
  Bottom2Top,
  /** Вертикальная - С верху вниз */
  Top2Bottom,
  /** Диагональная от нижней левой точки к правой верхней */
  LeftBottom2RightTop,
  /** Диагональная от правой верхней к нижней левой точки */
  RightTop2LeftBottom,
  /** Диагональная от правой нижней к верхней левой */
  RightBottom2LeftTop,
  /** Диагональная от верхней левой к правой нижней */
  LeftTop2RightBottom
}


/** Выравнивание текста */
export enum TextPositionEnum
{
  /** По умолчанию Автоматическое расположение текста с анализом */
  Default = 0,
  /** Слева внизу с анализом */
  LeftBottom = 1,
  /** Лева в центре по вертикали с анализом */
  LeftMiddle = 2,
  /** Слева вверху с анализом */
  LeftTop = 3,
  /** Вверху в центре по горизонтали с анализом */
  TopMiddle = 4,
  /** Сверху справа с анализом */
  TopRight = 5,
  /** Справа в центре по вертикали с анализом */
  RightMiddle = 6,
  /** Справа снизу с анализом */
  RightBottom = 7,
  /** Снизу в центре по вертикали с анализом */
  BottomMiddle = 8,
  /** Произвольное положение текста явно заданное с анализом */
  PositionSets = 9,

  /** Слева внизу с анализом */
  LeftBottomInner = -1,
  /** Лева в центре по вертикали с анализом */
  LeftMiddleInner = -2,
  /** Слева вверху с анализом */
  LeftTopInner = -3,
  /** Вверху в центре по горизонтали с анализом */
  TopMiddleInner = -4,
  /** Сверху справа с анализом */
  TopRightInner = -5,
  /** Справа в центре по вертикали с анализом */
  RightMiddleInner = -6,
  /** Справа снизу с анализом */
  RightBottomInner = -7,
  /** Снизу в центре по вертикали с анализом */
  BottomMiddleInner = -8,
}


export enum FontStyleEnum
{
  Regular = 0x0,

  Bold = 0x1,

  Italic = 0x2,

  Underline = 0x4,

  Strikeout = 0x8
}
/** Графические свойства условного обозначения */
interface ILegendBlock
{
  id: BigInt;
  size: number;
  scaled: boolean;
}

/** Легенда для заливки */
export interface ILegendFill
{
  /** Цвет заливки 1 */
  color1: string;
  /** Цвет заливки 2 */
  color2: string;
  /** Масштабируемость заливки */
  scaled: boolean;
  /** Стиль заливки */
  style: FillStyleEnum;
  // fillHatchStyle:
  /** Стиль Градиентной заливки */
  gradientStyle: GradientStyle;
  block: ILegendBlock;
}

/** Графические свойства границы */
export interface ILegendBorder
{
  /** цвет */
  color: string;
  style: BorderStyleEnum;
  // dashStyle
  // startCap
  // endCap
  // dashCap
  /** Ориентация блока для границы */
  //Orientated
  /** Масштабируемость границы */
  scaled: boolean;
  size: number;
}

/** Графические свойства шрифта */
export interface ILegendFont
{
  family: string;
  size: number;
  //weight: number;
  style: FontStyleEnum
}

/** Графические свойства надписи */
export interface ILegendText
{
  /** Диапазон видимости */
  mashtabRange: IMashtabRange;
  /** Опорный масштаб */
  mashtabBase: number;
  /** Масштабируемость */
  scaled: boolean;
  /** Положение */
  position: TextPositionEnum;
  /** Цвет */
  color: string;
  /** Цвет фона */
  backColor: string;
  /** Шрифт */
  font: ILegendFont;
  isAnalyze: boolean;
}

/** Графические свойства */
export interface ILegend
{
  /** Уникальный идентификатор */
  id: number;
  /** Тип графического образа */
  type: GrTypeEnum;
  /** Диапазон видимости */
  mashtabRange: IMashtabRange;
  /** Приоритет */
  priority: number;
  /** Условное обозначение */
  block: ILegendBlock;
  /** Заливка */
  fill: ILegendFill;
  /** Граница */
  border: ILegendBorder;
  /** Надпись */
  text: ILegendText;

  /** Графические примитивы */
  primitives: IPrimitive[];
}
