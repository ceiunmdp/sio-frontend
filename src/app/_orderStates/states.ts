export enum ORDER_STATES {
   // IMPRESO = 1,
   // POR_IMPRIMIR = 2,
   // SOLICITADO = 3,
   // EN_PROCESO = 4,
   // PARA_RETIRAR = 5,
   // ENTREGADO = 6,
   // CANCELADO = 7
   SOLICITADO = 'requested',
   EN_PROCESO = 'in_process',
   PARA_RETIRAR = 'ready',
   ENTREGADO = 'delivered',
   NO_ENTREGADO = 'undelivered',
   CANCELADO = 'cancelled'
}
