import { Injectable } from '@angular/core';
import {EMPTY, Observable, Subject} from 'rxjs';
import {catchError, map, switchAll, tap} from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {environment} from 'src/environments/environment';
import {API} from "src/app/_api/api";
import {io} from 'socket.io-client';
import {AuthenticationService} from 'src/app/_services/authentication.service';


@Injectable({
  providedIn: "root"
})
export class WsOrdersService {
  socket;
  constructor(private authService: AuthenticationService){
    const token = this.authService.currentUserValue.token;
    const api = `${environment.wsUrl}${API.ORDERS}`;
    this.socket = io(api, {
      rememberUpgrade: true,
      auth: {
        token
      }
    });
    this.socket.on('connect', (ws) => console.log('Connected ws ', ws));
    this.socket.on('disconnect', (reason) => console.log('Disconnected: ', reason));
  }

  getPendingOrders(callback) {
    this.socket.emit('pending_orders');
    return this.socket.on('pending_orders', callback);
  }

  subscribeToNewPendingOrder(callback) {
    this.socket.on('new_pending_order', callback);
  }

  subscribeToUpdatedOrder(callback) {
    this.socket.on('updated_order', callback);
  }

  subscribeToUpdatedOrderFile(callback) {
    this.socket.on('updated_order_file', callback);
  }

  subscribeToUpdatedBindingGroup(callback) {
    this.socket.on('updated_binding_group', callback);
  }

  joinOrderRoom(orderId){
    console.log(orderId);
    this.socket.emit('join_order_room', { orderId });
  }

  leaveOrderRoom(orderId){
    console.log(orderId);
    this.socket.emit('left_order_room', { orderId });
    this.socket.off(orderId)
  }

  getUpdatedOrderFile(callback) { 
    this.socket.on('updated_order_file', callback);
  }

  getUpdatedBindingGroup(callback) { 
    this.socket.on('updated_binding_group', callback);
  }


}
