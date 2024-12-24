### TRABAJO:
La idea principal del trabajo es clonar la parte de mensajeria de discord. Crear un sistema de registro de usuarios con todas las funciones basicas que esto conlleva como recuperar contraseña y demas, y un sistema de chats por grupos (servidores y canales) y privados entre los usuarios.

## DESAFIOS:
Sin duda uno de mis mayores desafios fueron las mediaqueries y la normalizacion de los forms y las validaciones. Las querys de SQL costaron mucho al principio pero terminaron resultando sencillas luego de encontrarme con alguna que otra query desafiante. Siento que afianze bastante con el backend luego de bastante debugging al crear los controladores, repositories y los middlewares. El despliegue me ayudo a acostumbrarme a usar las variables de entorno las cuales no entendia muy bien. 
# El mayor problema que no logre solucionar es la perdida de los valores extraidos del contexto al recargar manualmente el frontend, ya que no pierden sus valores en el sessionStorage pero si en el componente en el que los llamo y uso como estados. Intente revisar documentacion de useContext, useEffect y useState pero no pude darme con una solucion😅.

## Librerias usadas:
-Bcrypt.js (bcrypt regular me daba errores)
-jsonwebtoken
-mysql2
-express
-react
-react-router-dom
-dotenv
-nodemailer
-mongoose(Para el testing del primer controller, luego reemplazado por SQL para normalizar)