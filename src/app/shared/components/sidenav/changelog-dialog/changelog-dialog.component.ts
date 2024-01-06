import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '../../button/button.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-changelog-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './changelog-dialog.component.html',
  styleUrl: './changelog-dialog.component.scss',
})
export class ChangelogDialogComponent implements OnInit {
  public readonly dialogRef = inject(MatDialogRef<ChangelogDialogComponent>);
  private readonly http = inject(HttpClient);
  private readonly data = inject(MAT_DIALOG_DATA);
  // Not sure how I want to handle uploading changelogs, this will be my solution for now.
  readonly changelogUrl = 'https://tts-helper.s3.us-east-2.amazonaws.com/changelog';
  header = 'Loading version changelog...';
  bulletPoints: { type: string, content: string }[] = [];

  ngOnInit() {
    const { version } = this.data;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    this.http.get<{
      headers: string,
      bulletPoints: { type: string, content: string }[]
    }>(`${this.changelogUrl}/${version}.json`, {
      headers,
    })
      .subscribe((data) => {
        this.header = data.headers;
        this.bulletPoints = data.bulletPoints;
      });
  }

  close() {
    this.dialogRef.close(false);
  }

  update() {
    this.dialogRef.close(true);
  }
}
