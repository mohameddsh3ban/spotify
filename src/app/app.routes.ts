import { Routes } from '@angular/router';
import { CallbackComponent } from './core/shared/call-back/call-back.component';
import { LoginComponent } from './core/views/auth/login/login.component';
import { HomeComponent } from './core/views/home/home.component';
import { PlaylistPageComponent } from './core/views/playlist-page/playlist-page.component';
import { AlbumPageComponent } from './core/views/album-page/album-page.component';


export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'callback', component: CallbackComponent },
    {path:'auth/login', component:LoginComponent },
    {path:'playlist/:id', component:PlaylistPageComponent},
    {path:'album/:id', component:AlbumPageComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];