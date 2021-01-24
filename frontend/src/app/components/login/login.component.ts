import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.UserData.subscribe((user) => {
        if (user) {
          this.router.navigateByUrl('/').then();
        }
      })
    );
  }

  login(form: NgForm): void {
    const { email, password } = form.value;

    if (!form.valid) {
      return;
    }

    this.authService.SignIn(email, password);

    form.resetForm();
  }

  ngOnDestroy(): void {
    this.subs.map((s) => s.unsubscribe);
  }

  openRegister(): void {
    const dialogRef = this.matDialog.open(RegisterComponent, {
      role: 'dialog',
      height: '480px',
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      const { fname, lname, email, password, avatar } = result;

      if (result !== undefined) {
        this.authService.SignUp(
          email,
          password,
          fname,
          lname,
          'https://portal.staralliance.com/cms/aux-pictures/prototype-images/avatar-default.png/@@images/image.png'
        );
      }

      return;
    });
  }
}
