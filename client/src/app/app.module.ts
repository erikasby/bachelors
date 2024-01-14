import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CardComponent } from './components/card/card.component';
import { SortComponent } from './components/sort/sort.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { CommunitiesComponent } from './pages/communities/communities.component';
import { PeopleComponent } from './pages/people/people.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { SettingsComponent } from './pages/user/settings/settings.component';
import { FollowingComponent } from './pages/user/following/following.component';
import { BookmarksComponent } from './pages/user/bookmarks/bookmarks.component';
import { CommunityComponent } from './pages/communities/community/community.component';
import { WriterComponent } from './components/writer/writer.component';
import { CommentComponent } from './components/comment/comment.component';
import { PostComponent } from './pages/post/post.component';
import { CardMinisculeComponent } from './components/card-miniscule/card-miniscule.component';
import { ResponseComponent } from './components/response/response.component';
import { CommunitySettingsComponent } from './pages/communities/community-settings/community-settings.component';
import { SearchComponent } from './pages/search/search.component';

// TODO:
// ArticlesPost should be renamed to Article
// CommunityPost and PeoplePost should be renamed to Post and be as a 1 file

const routes: Routes = [
  // { path: '', component: ArticlesComponent },
  // { path: 'a', redirectTo: '/', pathMatch: 'full' },
  { path: '', component: CommunitiesComponent },
  // { path: 'p', component: PeopleComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'register', component: RegisterComponent },
  // { path: 'forgotpassword', component: ForgotPasswordComponent },
  // { path: 'u/:username', component: ProfileComponent },
  { path: 'u/following', component: FollowingComponent },
  { path: 'u/bookmarks', component: BookmarksComponent },
  { path: 'u/settings', component: SettingsComponent },
  { path: 'u/:username', component: ProfileComponent },
  // { path: 'a/:id', component: ArticlesPostComponent },
  // { path: 'c/:id', component: CommunitiesPostComponent },
  // { path: 'p/:id', component: PeoplePostComponent },
  // { path: 'a/post', component: ArticlesPostComponent },
  // { path: 'p/post', component: PeoplePostComponent },
  // { path: ':appendix/:place/:postid', component: PostComponent },
  { path: 'c/:community', component: CommunityComponent },
  { path: 'c/:community/p/:postId', component: PostComponent },
  { path: 'c/:community/settings', component: CommunitySettingsComponent },
  { path: 'search', component: SearchComponent },
  { path: '**', redirectTo: '', pathMatch: 'prefix' },
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CardComponent,
    SortComponent,
    ArticlesComponent,
    CommunitiesComponent,
    PeopleComponent,
    SigninComponent,
    ProfileComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    SettingsComponent,
    FollowingComponent,
    BookmarksComponent,
    CommunityComponent,
    WriterComponent,
    CommentComponent,
    PostComponent,
    CardMinisculeComponent,
    ResponseComponent,
    CommunitySettingsComponent,
    SearchComponent,
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
