import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/ui/icon';
@Component({
  imports: [RouterLink, Icon],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome {}
