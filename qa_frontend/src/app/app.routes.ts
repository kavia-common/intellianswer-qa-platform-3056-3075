import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';

const routes: Routes = [
  { path: '', component: ChatComponent, pathMatch: 'full' },
  { path: 'chat', component: ChatComponent },
  // Future: { path: 'history', component: HistoryComponent },
  // Future: { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
