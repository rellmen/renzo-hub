// Técnica por ejercicio (claves de ejecución y error típico). Orientativo; ante dolor, para y consulta a un profesional.
// Biblioteca de 100+ ejercicios (2.37.0). Contrato: exerciseInfo(name) → ficha o null; exerciseLibrary() → [{name,muscle,pattern,equipment}].
import { RECOMP_PLAN } from "./recomp-plan.js";
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
// Ampliación 2.37.0: misma forma de ficha + grupo muscular del editor de rutinas.
const N = (muscle, pattern, equipment, cues, mistake, barbell = null) => ({ muscle, ...I(pattern, equipment, cues, mistake, barbell) });
const MORE = {
  // Pecho
  "Barbell Bench Press": N("Pecho", "Empuje horizontal", "Barra", ["Escápulas juntas y pies firmes en el suelo", "Baja la barra al pecho medio con codos a ~45°", "Empuja hacia arriba y ligeramente hacia la cara"], "Rebotar la barra en el pecho", 20),
  "Incline Barbell Bench Press": N("Pecho", "Empuje inclinado", "Barra", ["Banco a 30°, escápulas atrás", "Baja a la parte alta del pecho", "Empuja sin despegar glúteos del banco"], "Inclinar demasiado el banco y convertirlo en press de hombro", 20),
  "Dumbbell Bench Press": N("Pecho", "Empuje horizontal", "Mancuernas", ["Mancuernas a la altura del pecho, muñecas rectas", "Empuja juntando ligeramente arriba", "Baja hasta notar estiramiento sin perder escápulas"], "Bajar con los codos totalmente abiertos"),
  "Smith Machine Bench Press": N("Pecho", "Empuje horizontal", "Smith", ["Coloca el banco para que la barra baje al pecho medio", "Escápulas juntas durante toda la serie", "Controla la bajada 2 segundos"], "Colocar el banco mal y bajar al cuello", 20),
  "Decline Chest Press": N("Pecho", "Empuje declinado", "Máquina", ["Agarres a la altura del pecho bajo", "Empuja sin encoger hombros", "Vuelve hasta estirar"], "Bloquear los codos de golpe"),
  "Push-Up": N("Pecho", "Empuje horizontal", "Peso corporal", ["Manos algo más anchas que los hombros, cuerpo en bloque", "Baja el pecho casi al suelo con codos a ~45°", "Empuja sin hundir la cadera"], "Dejar caer la cadera o no bajar del todo"),
  "Low-to-High Cable Fly": N("Pecho", "Aducción horizontal", "Polea", ["Poleas bajas, codos ligeramente flexionados", "Sube en arco hasta la altura de la barbilla", "Baja lento hasta estirar"], "Doblar los codos y empujar"),
  "Dumbbell Fly": N("Pecho", "Aducción horizontal", "Mancuernas", ["Codos ligeramente flexionados y fijos", "Abre hasta notar estiramiento sin dolor", "Cierra como si abrazaras un árbol"], "Bajar demasiado con peso alto"),
  "Pec Deck": N("Pecho", "Aducción horizontal", "Máquina", ["Asiento para que los agarres queden a la altura del pecho", "Junta los brazos apretando el pecho", "Abre lento hasta notar estiramiento"], "Despegar la espalda del respaldo"),
  "Chest Dip": N("Pecho", "Empuje vertical", "Paralelas", ["Inclina el torso hacia delante", "Baja hasta ~90° de codo o donde no moleste el hombro", "Empuja sin balanceo"], "Bajar demasiado y forzar el hombro"),
  // Espalda
  "Pull-Up": N("Espalda", "Tracción vertical", "Barra fija", ["Agarre prono algo más ancho que los hombros", "Empieza bajando los hombros y lleva el pecho a la barra", "Baja hasta estirar del todo"], "Hacer medias repeticiones con balanceo"),
  "Chin-Up": N("Espalda", "Tracción vertical", "Barra fija", ["Agarre supino a la anchura de hombros", "Codos hacia las costillas", "Baja controlado hasta estirar"], "Subir solo la barbilla estirando el cuello"),
  "Assisted Pull-Up": N("Espalda", "Tracción vertical", "Máquina asistida", ["Más contrapeso = más ayuda", "Pecho alto y codos hacia abajo", "Estira del todo abajo"], "Usar tanta ayuda que no hay esfuerzo real"),
  "Barbell Row": N("Espalda", "Tracción horizontal", "Barra", ["Torso inclinado ~45°, espalda neutra", "Lleva la barra al ombligo con los codos", "Baja sin redondear la espalda"], "Levantar el torso para mover más peso", 20),
  "T-Bar Row": N("Espalda", "Tracción horizontal", "Barra T o máquina", ["Pecho alto, rodillas flexionadas", "Tira con codos pegados", "Estira abajo sin perder la postura"], "Redondear la zona lumbar"),
  "Machine Row": N("Espalda", "Tracción horizontal", "Máquina", ["Pecho en el apoyo", "Tira llevando los codos atrás", "Vuelve hasta estirar los dorsales"], "Acortar el recorrido para mover más peso"),
  "Meadows Row": N("Espalda", "Tracción horizontal unilateral", "Barra en landmine", ["Postura escalonada, mano libre apoyada", "Tira del extremo de la barra hacia la cadera", "Estira bien abajo"], "Girar el torso"),
  "Wide-Grip Seated Row": N("Espalda", "Tracción horizontal", "Polea", ["Agarre ancho, codos a ~60°", "Lleva la barra al pecho bajo", "Junta escápulas y vuelve lento"], "Echar el cuerpo atrás"),
  "Dumbbell Pullover": N("Espalda", "Extensión de hombro", "Mancuerna", ["Espalda alta sobre el banco, cadera baja", "Baja la mancuerna detrás de la cabeza con codos suaves", "Sube hasta encima del pecho"], "Doblar mucho los codos"),
  "Back Extension": N("Espalda", "Extensión de cadera y espalda", "Banco romano", ["Cadera en el borde del apoyo", "Baja con la espalda neutra", "Sube hasta alinear el cuerpo sin hiperextender"], "Hiperextender la zona lumbar arriba"),
  "Barbell Shrug": N("Espalda", "Elevación escapular", "Barra", ["Brazos rectos, barra pegada", "Sube los hombros hacia las orejas", "Pausa arriba y baja lento"], "Girar los hombros en círculos", 20),
  "Dumbbell Shrug": N("Espalda", "Elevación escapular", "Mancuernas", ["Mancuernas a los lados", "Sube los hombros recto hacia arriba", "Pausa y baja controlado"], "Doblar los codos"),
  // Hombros
  "Overhead Press": N("Hombros", "Empuje vertical", "Barra", ["De pie, glúteos y abdomen apretados", "Empuja la barra pasando cerca de la cara", "Termina con la barra sobre la mitad del pie"], "Arquear la espalda para empujar", 20),
  "Seated Dumbbell Shoulder Press": N("Hombros", "Empuje vertical", "Mancuernas", ["Respaldo casi vertical", "Mancuernas a la altura de las orejas", "Empuja sin chocar arriba"], "Bajar poco y perder el recorrido"),
  "Arnold Press": N("Hombros", "Empuje vertical", "Mancuernas", ["Empieza con palmas hacia ti", "Gira las muñecas mientras empujas", "Baja deshaciendo el giro"], "Hacerlo rápido y sin control"),
  "Cable Upright Row": N("Hombros", "Abducción con tracción", "Polea", ["Agarre a la anchura de hombros", "Sube con los codos hasta la altura del hombro", "Baja lento"], "Subir los codos por encima del hombro si molesta"),
  "Rear Delt Fly": N("Hombros", "Abducción horizontal", "Mancuernas", ["Torso inclinado, espalda neutra", "Abre los brazos con codos suaves", "Piensa en llevar las manos lejos, no atrás"], "Juntar escápulas con impulso"),
  "Cable Rear Delt Fly": N("Hombros", "Abducción horizontal", "Polea", ["Cables cruzados a la altura de los hombros", "Abre hacia los lados", "Vuelve controlando"], "Tirar con la espalda"),
  "Face Pull": N("Hombros", "Rotación externa con tracción", "Polea", ["Cuerda a la altura de la cara", "Tira separando las manos hacia las orejas", "Codos altos, pausa atrás"], "Tirar con la espalda baja inclinándose"),
  // Piernas y glúteos
  "Back Squat": N("Piernas", "Sentadilla", "Barra", ["Barra sobre trapecio, pies a la anchura de hombros", "Baja con rodillas en la línea de los pies", "Sube empujando el suelo con todo el pie"], "Dejar que las rodillas se vayan hacia dentro", 20),
  "Front Squat": N("Piernas", "Sentadilla", "Barra", ["Barra sobre los hombros delanteros, codos altos", "Torso erguido al bajar", "Sube manteniendo los codos arriba"], "Dejar caer los codos y redondear", 20),
  "Hack Squat": N("Piernas", "Sentadilla", "Máquina", ["Espalda pegada al respaldo", "Baja hasta ~90° o más si es cómodo", "Empuja sin bloquear rodillas"], "Despegar los talones"),
  "Smith Machine Squat": N("Piernas", "Sentadilla", "Smith", ["Pies algo adelantados", "Baja controlado con espalda neutra", "Empuja con todo el pie"], "Pies demasiado atrás que cargan la rodilla", 20),
  "Goblet Squat": N("Piernas", "Sentadilla", "Mancuerna o kettlebell", ["Peso pegado al pecho", "Baja entre las piernas con torso erguido", "Sube empujando el suelo"], "Redondear la espalda abajo"),
  "Bulgarian Split Squat": N("Piernas", "Zancada", "Mancuernas", ["Pie trasero en el banco, pie delantero lejos", "Baja recto hasta casi tocar con la rodilla", "Empuja con el pie delantero"], "Pie delantero demasiado cerca del banco"),
  "Walking Lunge": N("Piernas", "Zancada", "Mancuernas", ["Pasos largos y controlados", "Rodilla trasera casi al suelo", "Torso erguido"], "Pasos cortos que cargan la rodilla"),
  "Reverse Lunge": N("Piernas", "Zancada", "Mancuernas", ["Da el paso atrás", "Baja recto con el peso en la pierna delantera", "Vuelve empujando con el talón delantero"], "Inclinar el torso y perder el equilibrio"),
  "Step-Up": N("Piernas", "Zancada", "Mancuernas y cajón", ["Pie entero sobre el cajón", "Sube empujando con la pierna de arriba", "Baja lento"], "Impulsarse con la pierna de abajo"),
  "Pendulum Squat": N("Piernas", "Sentadilla", "Máquina", ["Espalda pegada, pies en el centro", "Baja profundo controlado", "Empuja sin bloquear"], "Bajar rápido y rebotar"),
  "Belt Squat": N("Piernas", "Sentadilla", "Máquina", ["Cinturón en la cadera, torso erguido", "Baja con rodillas hacia fuera", "Sube con todo el pie"], "Inclinarse demasiado hacia delante"),
  "Seated Leg Curl": N("Piernas", "Flexión de rodilla", "Máquina", ["Rodilla alineada con el eje, muslo sujeto", "Flexiona del todo", "Vuelve lento hasta estirar"], "Levantar la cadera"),
  "Lying Leg Curl": N("Piernas", "Flexión de rodilla", "Máquina", ["Cadera pegada al banco", "Lleva los talones al glúteo", "Baja sin soltar"], "Despegar la cadera para subir"),
  "Nordic Curl": N("Piernas", "Flexión de rodilla excéntrica", "Peso corporal", ["Tobillos sujetos, cuerpo recto de rodillas a cabeza", "Baja lo más lento posible", "Ayúdate con las manos para volver"], "Doblar la cadera para acortar"),
  "Good Morning": N("Piernas", "Bisagra de cadera", "Barra", ["Barra en trapecio, rodillas suaves", "Lleva la cadera atrás con espalda neutra", "Sube apretando glúteo"], "Redondear la espalda", 20),
  "Deadlift": N("Piernas", "Bisagra de cadera", "Barra", ["Barra sobre la mitad del pie, espalda neutra", "Empuja el suelo y lleva la barra pegada", "Termina con cadera extendida sin echarte atrás"], "Tirar con la espalda redondeada", 20),
  "Sumo Deadlift": N("Piernas", "Bisagra de cadera", "Barra", ["Pies anchos, puntas hacia fuera", "Rodillas empujando hacia fuera", "Pecho alto y empuja el suelo"], "Subir la cadera antes que la barra", 20),
  "Trap Bar Deadlift": N("Piernas", "Bisagra de cadera", "Barra hexagonal", ["Colócate en el centro de la barra", "Espalda neutra, empuja con las piernas", "Termina erguido"], "Redondear la espalda al empezar", 25),
  "Seated Calf Raise": N("Piernas", "Flexión plantar", "Máquina", ["Rodillas a 90° bajo el apoyo", "Estira abajo un segundo", "Sube a la punta del pie"], "Rebotar abajo"),
  "Leg Press Calf Raise": N("Piernas", "Flexión plantar", "Prensa", ["Puntas en el borde de la plataforma", "Rodillas casi rectas", "Recorrido completo y lento"], "Recorridos cortos"),
  "Hip Adduction Machine": N("Piernas", "Aducción de cadera", "Máquina", ["Espalda pegada", "Junta las piernas controlando", "Abre lento hasta notar estiramiento"], "Soltar el peso al abrir"),
  "Hip Abduction Machine": N("Glúteos", "Abducción de cadera", "Máquina", ["Ligera inclinación hacia delante", "Abre empujando con las rodillas", "Vuelve lento"], "Balancearse con el torso"),
  "Cable Glute Kickback": N("Glúteos", "Extensión de cadera", "Polea", ["Tobillera, torso inclinado y apoyado", "Lleva la pierna atrás con la rodilla suave", "Aprieta el glúteo sin arquear la espalda"], "Arquear la zona lumbar"),
  "Glute Bridge": N("Glúteos", "Extensión de cadera", "Barra o peso corporal", ["Espalda en el suelo, pies cerca del glúteo", "Sube la cadera apretando glúteo", "Pausa arriba"], "Empujar con la espalda", 20),
  "Cable Pull-Through": N("Glúteos", "Bisagra de cadera", "Polea", ["De espaldas a la polea baja, cuerda entre las piernas", "Lleva la cadera atrás", "Extiende apretando glúteo"], "Tirar con los brazos"),
  // Bíceps
  "Barbell Curl": N("Bíceps", "Flexión de codo", "Barra", ["Codos pegados", "Sube sin balanceo", "Baja controlado"], "Mover la cadera", 20),
  "Dumbbell Curl": N("Bíceps", "Flexión de codo", "Mancuernas", ["Palmas hacia delante", "Codos fijos", "Baja hasta estirar"], "Subir con impulso del hombro"),
  "Concentration Curl": N("Bíceps", "Flexión de codo", "Mancuerna", ["Codo apoyado en el muslo", "Sube girando la palma", "Aprieta arriba"], "Mover el hombro"),
  "Spider Curl": N("Bíceps", "Flexión de codo", "Mancuernas o barra EZ", ["Pecho sobre el banco inclinado, brazos colgando", "Sube sin mover los codos", "Baja lento"], "Recorrido corto abajo"),
  "Machine Curl": N("Bíceps", "Flexión de codo", "Máquina", ["Axila en el borde del apoyo", "Sube hasta arriba", "Baja controlado"], "Dejar caer el peso"),
  "Reverse Curl": N("Bíceps", "Flexión de codo", "Barra EZ", ["Agarre prono", "Codos fijos", "Controla la bajada"], "Doblar las muñecas", 10),
  // Tríceps
  "Skull Crusher": N("Tríceps", "Extensión de codo", "Barra EZ", ["Codos apuntando al techo y fijos", "Baja la barra detrás de la frente", "Extiende sin abrir codos"], "Abrir los codos hacia fuera", 10),
  "Close-Grip Bench Press": N("Tríceps", "Empuje horizontal", "Barra", ["Agarre a la anchura de hombros", "Codos pegados al bajar", "Empuja hasta extender"], "Agarre demasiado estrecho que fuerza muñecas", 20),
  "Rope Pushdown": N("Tríceps", "Extensión de codo", "Polea", ["Codos pegados", "Separa la cuerda abajo", "Sube hasta ~90°"], "Mover los codos hacia delante"),
  "Overhead Dumbbell Extension": N("Tríceps", "Extensión de codo", "Mancuerna", ["Mancuerna detrás de la cabeza con las dos manos", "Codos apuntando arriba", "Extiende del todo"], "Arquear la espalda"),
  "Triceps Kickback": N("Tríceps", "Extensión de codo", "Mancuerna o polea", ["Torso inclinado, codo pegado al costado", "Extiende el brazo atrás", "Pausa y vuelve lento"], "Balancear el brazo"),
  "Single Arm Cable Pushdown": N("Tríceps", "Extensión de codo", "Polea", ["Agarre simple, codo fijo", "Extiende del todo", "Vuelve controlado"], "Girar el torso"),
  // Core
  "Plank": N("Core", "Antiextensión", "Peso corporal", ["Antebrazos bajo los hombros", "Glúteos y abdomen apretados", "Cuerpo en línea recta"], "Hundir la cadera"),
  "Ab Wheel Rollout": N("Core", "Antiextensión", "Rueda abdominal", ["De rodillas, pelvis recogida", "Avanza hasta donde mantengas la espalda neutra", "Vuelve tirando con el abdomen"], "Arquear la zona lumbar"),
  "Hanging Leg Raise": N("Core", "Flexión de cadera y tronco", "Barra fija", ["Cuerpo quieto", "Sube las piernas casi rectas enrollando la pelvis", "Baja lento"], "Balancearse"),
  "Pallof Press": N("Core", "Antirotación", "Polea", ["De lado a la polea, cable a la altura del pecho", "Empuja al frente sin girar", "Pausa 2 segundos"], "Dejar que el cable te gire"),
  "Decline Crunch": N("Core", "Flexión de tronco", "Banco declinado", ["Pies sujetos", "Enrolla la columna hacia arriba", "Baja lento"], "Tirar del cuello con las manos"),
  "Dead Bug": N("Core", "Antiextensión", "Peso corporal", ["Espalda baja pegada al suelo", "Extiende brazo y pierna contrarios", "Vuelve y cambia de lado"], "Despegar la zona lumbar")
};
// Grupo muscular (según el editor de rutinas) de las fichas originales.
const BASE_MUSCLE = {
  "Lat Pulldown": "Espalda", "Neutral-Grip Lat Pulldown": "Espalda", "Single Arm Lat Pulldown": "Espalda", "Chest Supported Row": "Espalda", "Seated Cable Row": "Espalda", "Single Arm Row": "Espalda", "Straight Arm Pulldown": "Espalda",
  "EZ Bar Curl": "Bíceps", "Incline Dumbbell Curl": "Bíceps", "Hammer Curl": "Bíceps", "Preacher Curl": "Bíceps", "Bayesian Cable Curl": "Bíceps", "Cable Curl": "Bíceps",
  "Incline Machine/Smith Press": "Pecho", "Incline Chest Press": "Pecho", "Chest Press": "Pecho", "Incline Dumbbell Press": "Pecho", "Cable Fly/Pec Deck": "Pecho", "Cable Fly": "Pecho",
  "Dip Machine": "Tríceps", "Shoulder Press": "Hombros", "Lateral Raise": "Hombros", "Cable Lateral Raise": "Hombros", "Machine/Cable Lateral Raise": "Hombros", "Reverse Pec Deck": "Hombros",
  "Triceps Pushdown": "Tríceps", "Overhead Cable Extension": "Tríceps",
  "Leg Press": "Piernas", "Romanian Deadlift": "Piernas", "Leg Curl": "Piernas", "Leg Extension": "Piernas", "Calf Raise": "Piernas", "Hip Thrust": "Glúteos",
  "Cable Crunch": "Core", "Hanging Knee Raise": "Core"
};
Object.entries(BASE_MUSCLE).forEach(([name, muscle]) => { if (INFO[name]) INFO[name].muscle = muscle; });
Object.assign(INFO, MORE);
const MUSCLE_ORDER = ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Piernas", "Glúteos", "Core"];
// Biblioteca completa para el editor de rutinas, ordenada por grupo muscular y nombre.
export function exerciseLibrary() {
  return Object.entries(INFO).map(([name, x]) => ({ name, muscle: x.muscle, pattern: x.pattern, equipment: x.equipment }))
    .sort((a, b) => MUSCLE_ORDER.indexOf(a.muscle) - MUSCLE_ORDER.indexOf(b.muscle) || a.name.localeCompare(b.name));
}
export const LIBRARY_MUSCLES = MUSCLE_ORDER;
// Nombres en castellano del programa Recomp → su ficha de la biblioteca (técnica, alternativas y rangos).
const ALIAS = Object.fromEntries(RECOMP_PLAN.flatMap(d => d[2].map(e => [e[0], e[7]?.ref])).filter(([, ref]) => ref));
export const canonicalExercise = name => (INFO[name] ? name : ALIAS[name] || name);
export function exerciseInfo(name) { return INFO[name] || INFO[ALIAS[name]] || null; }
export const exerciseInfoNames = () => Object.keys(INFO);
