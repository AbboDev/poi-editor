export interface Point {
  id: string;
  title: string;
  center: [number, number];
}

export interface MapStateInterface {
  points: Point[];
  center: [number, number];
}

function state(): MapStateInterface {
  return {
    points: [],
    center: [45.69173591, 9.23902452]
  };
}

export default state;
