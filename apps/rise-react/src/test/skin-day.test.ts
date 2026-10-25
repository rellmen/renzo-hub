import {describe,expect,it} from "vitest";
import {dateKeyLocal,skinRoutineDay,stepsFor} from "@/lib/skin-catalog.mjs";
const key=(d:Date)=>dateKeyLocal(skinRoutineDay(d));
describe("día de rutina de piel (corte 05:00)",()=>{
  it("la noche antes de medianoche cuenta para ese día",()=>{
    expect(key(new Date(2026,9,24,23,30))).toBe("2026-10-24");
  });
  it("la madrugada cuenta para la noche anterior",()=>{
    expect(key(new Date(2026,9,25,0,30))).toBe("2026-10-24");
    expect(key(new Date(2026,9,25,4,59))).toBe("2026-10-24");
  });
  it("a partir de las 05:00 empieza un checklist nuevo",()=>{
    expect(key(new Date(2026,9,25,5,0))).toBe("2026-10-25");
    expect(key(new Date(2026,9,25,11,40))).toBe("2026-10-25");
  });
  it("funciona en cambio de hora y fin de mes",()=>{
    expect(key(new Date(2026,9,25,2,30))).toBe("2026-10-24");
    expect(key(new Date(2026,10,1,3,0))).toBe("2026-10-31");
  });
  it("la rutina PM usa el día de la semana del día de rutina",()=>{
    const madrugada=skinRoutineDay(new Date(2026,9,25,1,0));
    expect(madrugada.getDay()).toBe(6);
    expect(stepsFor(madrugada,"pm")).toEqual(stepsFor(new Date(2026,9,24,21,0),"pm"));
  });
});
