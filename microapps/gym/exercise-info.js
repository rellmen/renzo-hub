// Técnica por ejercicio (claves de ejecución y error típico). Orientativo; ante dolor, para y consulta a un profesional.
// ChatGPT amplía esta biblioteca (ver docs/GYM-SYMMETRY.md). Contrato: exerciseInfo(name) → ficha o null.
const I = (pattern, equipment, cues, mistake, barbell = null) => ({ pattern, equipment, cues, mistake, barbell });
const INFO = {
  "Lat Pulldown": I("Tracción vertical", "Polea", ["Agarre algo más ancho que los hombros, pecho alto", "Lleva la barra a la parte alta del pecho tirando con los codos hacia abajo", "Sube controlando hasta estirar la espalda"], "Balancear el torso hacia atrás para mover más peso"),
  "Neutral-Grip Lat Pulldown": I("Tracción vertical", "Polea", ["Agarre neutro a la anchura de hombros", "Codos hacia las costillas, sin encoger hombros", "Pausa breve abajo y sube lento"], "Tirar con los bíceps en vez de con los codos"),
  "Single Arm Lat Pulldown": I("Tracción vertical unilateral", "Polea", ["Siéntate de lado al cable si te ayuda a estirar", "Lleva el codo hacia la cadera", "Estira del todo arriba sin perder la postura"], "Girar el tronco para acortar el recorrido"),
  "Chest Supported Row": I("Tracción horizontal", "Máquina o banco", ["Pecho pegado al apoyo durante toda la serie", "Tira con los codos hacia atrás y aprieta escápulas", "Baja hasta estirar sin despegar el pecho"], "Levantar el pecho del apoyo para ayudarte con impulso"),
  "Seated Cable Row": I("Tracción horizontal", "Polea", ["Espalda neutra, rodillas ligeramente flexionadas", "Lleva el agarre al ombligo con los codos cerca del cuerpo", "Deja que los hombros avancen un poco al estirar"], "Balancear la espalda adelante y atrás"),
  "Single Arm Row": I("Tracción horizontal unilateral", "Mancuerna", ["Mano y rodilla apoyadas, espalda plana", "Tira de la mancuerna hacia la cadera", "Baja hasta estirar el dorsal"], "Rotar el tronco para subir más alto"),
  "Straight Arm Pulldown": I("Extensión de hombro", "Polea", ["Brazos casi rectos, ligera inclinación del torso", "Lleva la barra hasta los muslos con los dorsales", "Sube lento hasta notar el estiramiento"], "Doblar los codos y convertirlo en un press de tríceps"),
  "EZ Bar Curl": I("Flexión de codo", "Barra EZ", ["Codos pegados a los costados", "Sube sin mover los hombros hacia delante", "Baja controlado hasta casi estirar"], "Balancear la cadera para subir la barra", 10),
  "Incline Dumbbell Curl": I("Flexión de codo", "Mancuernas", ["Banco a 45–60°, brazos colgando detrás del cuerpo", "Sube girando la palma hacia arriba", "Baja lento: aquí está el estiramiento"], "Adelantar los codos al subir"),
  "Hammer Curl": I("Flexión de codo", "Mancuernas", ["Agarre neutro (pulgares arriba)", "Codos fijos a los costados", "Alterna o a la vez, siempre controlado"], "Subir con impulso del hombro"),
  "Preacher Curl": I("Flexión de codo", "Banco Scott", ["Axila apoyada en el borde del banco", "Sube sin despegar los brazos del apoyo", "Baja despacio sin bloquear el codo de golpe"], "Dejar caer el peso abajo"),
  "Bayesian Cable Curl": I("Flexión de codo", "Polea", ["De espaldas a la polea, brazo detrás del cuerpo", "Sube manteniendo el codo atrás", "Estira del todo en cada repetición"], "Mover el codo hacia delante"),
  "Cable Curl": I("Flexión de codo", "Polea", ["Codos fijos, muñecas neutras", "Aprieta arriba un segundo", "Baja controlando la tensión"], "Inclinarse hacia atrás"),
  "Incline Machine/Smith Press": I("Empuje inclinado", "Máquina o Smith", ["Banco a 30°, escápulas juntas", "Baja a la parte alta del pecho con codos a ~45°", "Empuja sin despegar la espalda"], "Abrir los codos a 90° y bajar demasiado rápido", 20),
  "Incline Chest Press": I("Empuje inclinado", "Máquina", ["Asiento para que los agarres queden a la altura del pecho alto", "Empuja sin encoger hombros", "Vuelve hasta notar el estiramiento"], "Rebotar al final del recorrido"),
  "Chest Press": I("Empuje horizontal", "Máquina", ["Agarres a la altura del pecho medio", "Escápulas atrás y abajo", "Empuja y vuelve lento"], "Despegar la espalda del respaldo"),
  "Incline Dumbbell Press": I("Empuje inclinado", "Mancuernas", ["Banco a 30°, mancuernas a la altura del pecho", "Empuja hacia arriba juntando ligeramente", "Baja controlado hasta estirar"], "Chocar las mancuernas y perder tensión"),
  "Cable Fly/Pec Deck": I("Aducción horizontal", "Polea o máquina", ["Codos ligeramente flexionados y fijos", "Abraza hacia delante con el pecho", "Abre hasta notar estiramiento, sin dolor de hombro"], "Convertirlo en un press doblando los codos"),
  "Cable Fly": I("Aducción horizontal", "Polea", ["Un paso adelante, ligera inclinación", "Arco amplio con codos fijos", "Junta las manos frente al pecho"], "Usar demasiado peso y perder el arco"),
  "Dip Machine": I("Empuje vertical", "Máquina", ["Torso erguido para centrar en tríceps", "Empuja hasta casi extender", "Sube controlado hasta ~90° de codo"], "Encoger hombros hacia las orejas"),
  "Shoulder Press": I("Empuje vertical", "Máquina o mancuernas", ["Agarres a la altura de las orejas", "Empuja sin arquear la zona lumbar", "Baja controlado"], "Arquear la espalda para empujar"),
  "Lateral Raise": I("Abducción de hombro", "Mancuernas", ["Ligera inclinación hacia delante", "Sube con los codos hasta la altura del hombro", "Baja lento, sin descansar abajo"], "Subir con impulso y trapecio"),
  "Cable Lateral Raise": I("Abducción de hombro", "Polea", ["Polea baja, cable por delante o detrás del cuerpo", "Sube hasta la altura del hombro", "Tensión constante también abajo"], "Inclinar el cuerpo hacia el lado contrario"),
  "Machine/Cable Lateral Raise": I("Abducción de hombro", "Máquina o polea", ["Ajusta el eje a la altura del hombro", "Empuja con los codos, no con las manos", "Controla la bajada"], "Encoger los hombros"),
  "Reverse Pec Deck": I("Abducción horizontal", "Máquina", ["Pecho al apoyo, brazos casi rectos", "Abre llevando los brazos hacia atrás", "Pausa breve y vuelve lento"], "Juntar escápulas en vez de mover los brazos"),
  "Triceps Pushdown": I("Extensión de codo", "Polea", ["Codos pegados y fijos", "Extiende del todo abajo", "Sube hasta ~90° sin mover los codos"], "Inclinarse encima del cable para empujar con el cuerpo"),
  "Overhead Cable Extension": I("Extensión de codo", "Polea", ["De espaldas a la polea, codos junto a la cabeza", "Extiende hacia delante y arriba", "Vuelve hasta estirar bien el tríceps"], "Abrir los codos hacia fuera"),
  "Leg Press": I("Empuje de piernas", "Máquina", ["Pies a la anchura de cadera en el centro de la plataforma", "Baja hasta ~90° de rodilla sin despegar la zona lumbar", "Empuja con todo el pie sin bloquear rodillas"], "Bajar tanto que la pelvis se despega del respaldo"),
  "Romanian Deadlift": I("Bisagra de cadera", "Barra o mancuernas", ["Rodillas ligeramente flexionadas y fijas", "Lleva la cadera atrás con la espalda neutra", "Baja hasta notar los isquios y sube apretando glúteo"], "Redondear la espalda para bajar más", 20),
  "Leg Curl": I("Flexión de rodilla", "Máquina", ["Rodilla alineada con el eje de la máquina", "Flexiona del todo y aprieta", "Vuelve lento sin soltar la tensión"], "Levantar la cadera del asiento"),
  "Leg Extension": I("Extensión de rodilla", "Máquina", ["Espalda pegada, eje alineado con la rodilla", "Extiende y aprieta un segundo", "Baja controlado"], "Patear con impulso"),
  "Calf Raise": I("Flexión plantar", "Máquina", ["Estira abajo un segundo", "Sube a la punta del pie del todo", "Ritmo lento, sin rebote"], "Recorridos cortos y rápidos"),
  "Hip Thrust": I("Extensión de cadera", "Barra o máquina", ["Escápulas en el banco, barbilla recogida", "Sube hasta alinear tronco y muslos", "Aprieta glúteo arriba"], "Hiperextender la zona lumbar", 20),
  "Cable Crunch": I("Flexión de tronco", "Polea", ["De rodillas, cuerda junto a la cabeza", "Enrolla la columna llevando costillas a la pelvis", "Vuelve controlado"], "Flexionar la cadera en vez del abdomen"),
  "Hanging Knee Raise": I("Flexión de cadera y tronco", "Barra o paralelas", ["Cuerpo quieto, sin balanceo", "Sube las rodillas y enrolla la pelvis", "Baja lento"], "Balancearse para subir")
};
export function exerciseInfo(name) { return INFO[name] || null; }
export const exerciseInfoNames = () => Object.keys(INFO);
