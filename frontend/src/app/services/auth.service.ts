import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userData: Observable<firebase.default.User>;
  private currentUser: IUserData;
  private currentUser$ = new BehaviorSubject<IUserData>(null);

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this._userData = afAuth.authState;

    this._userData.subscribe((user) => {
      if (user) {
        this.afs
          .collection<IUserData>('users')
          .doc<IUserData>(user.uid)
          .valueChanges()
          .subscribe((currentUser) => {
            this.currentUser = currentUser;
            this.currentUser$.next(this.currentUser);
          });
      }
    });
  }

  CurrentUser(): Observable<IUserData> {
    return this.currentUser$.asObservable();
  }

  SignUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatar: string
  ): void {
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((res) => {
        if (res) {
          this.afs
            .collection('users')
            .doc(res.user.uid)
            .set({
              firstName,
              lastName,
              email,
              avatar,
            })
            .then((value) => {
              this.afs
                .collection<IUserData>('users')
                .doc<IUserData>(res.user.uid)
                .valueChanges()
                .subscribe((user) => {
                  if (user) {
                    this.currentUser$.next(user);
                  }
                });
            });
        }
      })
      .catch((err) => console.log(err));
  }

  get UserData(): Observable<firebase.default.User> {
    return this._userData;
  }

  SignIn(email: string, password: string): void {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        this._userData = this.afAuth.authState;

        this.afs
          .collection<IUserData>('users')
          .doc<IUserData>(res.user.uid)
          .valueChanges()
          .subscribe((user) => {
            this.currentUser = user;
            this.currentUser$.next(this.currentUser);
          });
      })
      .catch((err) => console.log(err.message));
  }

  Logout(): void {
    this.afAuth.signOut().then((res) => {
      this.currentUser = null;
      this.currentUser$.next(this.currentUser);
      this.router.navigateByUrl('/login').then();
    });
  }

  searchUserInDatabase(user_id: string): Observable<IUserData> {
    return this.afs
      .collection<IUserData>('users')
      .doc<IUserData>(user_id)
      .valueChanges();
  }
}

export interface IUserData {
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  id?: string;
}
