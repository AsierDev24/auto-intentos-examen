from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'Manual-AutoExamen.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)

teal = colors.HexColor('#0c716b')
ink = colors.HexColor('#19333a')
muted = colors.HexColor('#667879')
cream = colors.HexColor('#f4f1ea')
orange = colors.HexColor('#d97745')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='CoverTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=31, leading=36, textColor=ink, alignment=TA_CENTER, spaceAfter=10))
styles.add(ParagraphStyle(name='CoverSub', parent=styles['Normal'], fontSize=14, leading=20, textColor=muted, alignment=TA_CENTER, spaceAfter=20))
styles.add(ParagraphStyle(name='Section', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=teal, spaceBefore=16, spaceAfter=14))
styles.add(ParagraphStyle(name='Sub', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=ink, spaceBefore=9, spaceAfter=5))
styles.add(ParagraphStyle(name='Body2', parent=styles['BodyText'], fontSize=10.5, leading=15, textColor=ink, spaceAfter=10))
styles.add(ParagraphStyle(name='Small', parent=styles['BodyText'], fontSize=8.5, leading=12, textColor=muted))
styles.add(ParagraphStyle(name='Banner', parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=colors.white, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='Callout', parent=styles['BodyText'], fontSize=10.5, leading=15, textColor=ink, backColor=colors.HexColor('#e6f0ed'), borderColor=teal, borderWidth=.7, borderPadding=12, spaceBefore=13, spaceAfter=16))

def P(text, style='Body2'):
    return Paragraph(text, styles[style])

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#d6dfda'))
    canvas.line(18*mm, 16*mm, 192*mm, 16*mm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(muted)
    canvas.drawString(18*mm, 10*mm, 'AutoExamen  /  Manual de uso')
    canvas.drawRightString(192*mm, 10*mm, f'Página {doc.page}')
    canvas.restoreState()

story = []
story += [Spacer(1, 35*mm), P('AutoExamen', 'CoverTitle'), P('Tu mesa de estudio para preparar oposiciones de administración pública', 'CoverSub'), Spacer(1, 10*mm)]
table = Table([[P('IMPORTA', 'Banner'), P('GUARDA', 'Banner'), P('REPITE', 'Banner'), P('MEJORA', 'Banner')]], colWidths=[32.5*mm]*4)
table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),teal),('LINEBEFORE',(1,0),(-1,-1),.5,colors.HexColor('#72bcb1')),('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BOX',(0,0),(-1,-1),0,teal),('PADDING',(0,0),(-1,-1),10)]))
story += [table, Spacer(1, 35*mm), P('Versión 0.1 · Windows 10 y 11', 'Small'), PageBreak()]

story += [P('1. La idea', 'Section'), P('AutoExamen funciona como una biblioteca de exámenes para estudiar sin conexión. Importas un PDF de preguntas y otro con las respuestas, revisas lo detectado y guardas el banco para repetirlo cuando quieras.', 'Body2'), P('<b>Regla de oro:</b> guarda cada convocatoria con un nombre reconocible: “Administrativo AGE 2025”, “Administrativo Gobierno de Aragón” o “Administrativo DPZ”.', 'Callout'), P('La aplicación guarda tus exámenes en el equipo. No necesitas instalar Node.js, Rust ni SQLite.', 'Body2'), P('2. Importar un examen', 'Section'), P('1. Entra en <b>Importar</b>.', 'Body2'), P('2. Selecciona el PDF del cuestionario.', 'Body2'), P('3. Selecciona el PDF de la plantilla de respuestas.', 'Body2'), P('4. Pulsa <b>Preparar examen</b> y espera a que termine.', 'Body2'), P('5. Se abrirá la pantalla de revisión antes de comenzar.', 'Body2'), P('Si un documento está escaneado, AutoExamen puede usar OCR local. El procesamiento se realiza en tu equipo.', 'Callout'), PageBreak()]

story += [P('3. Revisar antes de estudiar', 'Section'), P('La pantalla de revisión evita que una pregunta mal leída entre silenciosamente en el examen.', 'Body2'), P('Puedes:', 'Sub'), P('• corregir el enunciado; • editar las cuatro opciones; • marcar una pregunta como normal, reserva o anulada; • dejar una pregunta pendiente para revisarla después.', 'Body2'), P('Cuando estés conforme, pulsa <b>Usar preguntas válidas</b>. Las preguntas pendientes no se incorporan.', 'Callout'), P('4. Guardar en Mi biblioteca', 'Section'), P('Después de revisar la importación, escribe el nombre del examen y pulsa <b>Guardar en mi biblioteca</b>. Después aparecerá en <b>Mis exámenes</b>.', 'Body2'), P('Desde la biblioteca puedes repetirlo, eliminarlo o seleccionarlo para crear un ultraexamen. Cerrar la aplicación no borra tus bancos.', 'Body2'), P('5. Formas de estudiar', 'Section'), P('<b>Repetir:</b> abre un examen guardado desde la biblioteca.', 'Body2'), P('<b>Ultraexamen:</b> activa la selección múltiple, marca dos o más bancos y genera una sesión combinada.', 'Body2'), P('<b>Favoritas:</b> durante el examen pulsa la estrella de una pregunta difícil.', 'Body2'), P('<b>Repasar falladas:</b> después de corregir, las preguntas incorrectas quedan disponibles para una sesión específica de repaso.', 'Body2'), PageBreak()]

story += [P('6. Cómo se calcula la nota', 'Section'), P('La aplicación permite adaptar la corrección a cada convocatoria desde <b>Configuración</b>.', 'Body2')]
data = [['Elemento', 'Configuración habitual'], ['Acierto', '1 punto'], ['Fallo', 'Resta 1/3, 1/4, 1/2 o nada'], ['Blanco', 'No suma ni resta'], ['Base', '100 preguntas por defecto'], ['Reservas', 'Sustituyen anuladas hasta completar la base']]
t = Table(data, colWidths=[55*mm, 105*mm], repeatRows=1)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),teal),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#c8d5d0')),('BACKGROUND',(0,1),(-1,-1),colors.HexColor('#fbfaf7')),('TEXTCOLOR',(0,1),(-1,-1),ink),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTNAME',(0,1),(0,-1),'Helvetica-Bold'),('PADDING',(0,0),(-1,-1),8)]))
story += [t, Spacer(1, 10), P('Si un examen tiene 105 preguntas pero la convocatoria cuenta 100, marca las anuladas y las reservas en la revisión. AutoExamen excluirá las anuladas y utilizará las reservas necesarias.', 'Callout'), P('7. Solución de problemas', 'Section'), P('<b>No aparecen preguntas:</b> comprueba que has seleccionado el cuestionario y la plantilla correctos. Si el PDF es una imagen, espera al OCR.', 'Body2'), P('<b>No aparece el examen guardado:</b> abre el mismo app.exe con el que lo guardaste. La biblioteca es local a cada instalación/origen de la aplicación.', 'Body2'), P('<b>Quieres empezar de cero:</b> elimina el examen desde Mis exámenes. Esta acción no afecta a los demás bancos.', 'Body2'), PageBreak(), P('8. Consejo de estudio', 'Section'), P('Empieza con un examen completo, revisa los fallos y vuelve al día siguiente solo con las preguntas difíciles. La constancia y el historial valen más que hacer sesiones interminables.', 'Callout'), P('AutoExamen  /  Estudia a tu ritmo.', 'Small')]

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=17*mm, bottomMargin=20*mm, title='Manual de uso de AutoExamen', author='AutoExamen')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
