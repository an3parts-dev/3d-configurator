export interface Configuration {
  material: 'zinc' | 'stainless';
  fittingType: {
    a: string;
    b: string;
  };
  fittingSize: {
    a: string;
    b: string;
  };
  fittingAngle: {
    a: string;
    b: string;
  };
  hoseColor: string;
  stealthHeatshrink: boolean;
  length: number;
  purpose: string;
  accessories: string;
  tubeColor?: string;
  tubeLength?: number;
  support1?: string;
  support2?: string;
  notes?: string;
}