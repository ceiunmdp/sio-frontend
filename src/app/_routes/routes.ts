export enum Routes {
   //Root paths
   ADMIN_ROOT_PATH= "/cei/admin",
   STUDENT_ROOT_PATH= "/cei/estudiante",
   CAMPUS_ROOT_PATH= "/cei/sede",
   PROFESSORSHIP_ROOT_PATH= "/cei/catedra",
   MAIN = "/cei/main",

   HOME = "/home",

   LOGIN = "/",
   NEW_ORDER = "/pedidos/nuevo-pedido",
   MY_ORDERS = "/pedidos/mis-pedidos",
   ORDER_DETAIL = "/pedidos/pedido",
   TRANSFER_MONEY = "/transferencia",
   MY_MOVEMENTS = "/movimientos",

   // Sede routes
   TOP_UP = "/estudiantes",
   MOVEMENTS_LIST = "/movimientos",
   ACTIVE_ORDERS = "/pedidos",
   HISTORICAL_ORDERS = "/pedidos-historicos",

   // Admin routes
   COURSES = "/materias",
   RELATIONS = "/relaciones",
   CAREERS = "/carreras",
   FILES = "/archivos",
   PARAMETERS = "/parametricas",
   ITEMS = "/articulos",
   BINDINGS = "/anillados",
   USERS = "/usuarios",
   CAMPUSES = "/sedes"
}
