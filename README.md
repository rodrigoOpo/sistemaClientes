Problema a solucionar
-El dueño de una clinica tenía un formulario en papel para registrar nuevos clientes
-Cada vez que alguien lo rellena, una secretaria copia los datos a mano dentro de excel
-Otra persona toma el excel, abre Word y genera el informe, lo convierte a PDF y lo manda por correo

El problema principal es que todo el proceso es manual
(Cliente) rellena papel --> (Clinica) Copiar a excel --> (Clinica) Generar informe en Word - Convirte en PDF --> (Clinica)Mandar por correo
Aprox. 40 veces por día se realiza este proceso. De lunes a sabado

Solución
-FOrmulario Web(cualquier persona lo rellena desde el telefono)
-Excel automático(los datos se guardan solos sin copiar nada)
-PFD generado(Reporte listo para imprimir en un click)

Demo
1)Formulario Web --> 2)FastAPI --> 3)Excel automático -->4)PDF generado
Excel yPDF se generan solos

Set Up técnico
-FastAPI(control de APIs)
-Openpyxl(Excel)
-Reportlab(PDF)
-Uvicorn(servidor)
-python-multipart??(para formularios)
