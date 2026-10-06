// Calcula con server/utils/teoria.ts los mismos casos que test_paridad_ts.py
// y los imprime como JSON. Requiere Node >= 22.6 (--experimental-strip-types).
import { estabilidad, notaEsperada, diaUmbral, retencion } from "../../server/utils/teoria.ts";

const casos = JSON.parse(process.argv[2]);
const salida = casos.map((c) => {
  const s = estabilidad(c.tipo, c.dificultad, c.repasos, c.calidad, c.escala);
  return {
    s,
    r7: retencion(7, s),
    dia: diaUmbral(s, c.umbral),
    nota: notaEsperada(c.tipo, c.horas, c.dificultad, c.repasos, c.calidad),
  };
});
console.log(JSON.stringify(salida));
