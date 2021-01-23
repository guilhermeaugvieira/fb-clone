import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userData;
  private currentUser;
  private currentUser$ = new BehaviorSubject<IUserData>(null);

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) {
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
    lastname: string,
    avatar: 'https://portal.staralliance.com/cms/aux-pictures/prototype-images/avatar-default.png/@@images/image.png'
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
            .then((): void => {
              this.afs
                .collection<IUserData>('users')
                .doc(res.user.id)
                .valueChanges()
                .subscribe((user) => {
                  if (user) {
                    this.currentUser = user;
                    this.currentUser$.next(this.currentUser);
                  }
                });
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }

  getUserData(): Observable<firebase.default.User> {
    return this._userData;
  }

  SignIn(email: string, password: string): void {
    this.afAuth.signInWithEmailAndPassword(email, password).then((res) => {
      this._userData = this.afAuth.authState;
    });
  }
}

export interface IUserData {
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  id?: string;
}
