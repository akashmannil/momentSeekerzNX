import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { IMAGES } from '../../shared/image-assets';

@Component({
  selector: 'sm-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  form: FormGroup;
  submitted = false;
  error: string | null = null;
  loading = false;
  readonly images = IMAGES;

  constructor(private readonly fb: FormBuilder, private readonly api: ApiService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.maxLength(200)],
      message: ['', [Validators.required, Validators.maxLength(2000)]],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    // Simple contact form — no dedicated endpoint required (can be extended)
    setTimeout(() => {
      this.submitted = true;
      this.loading = false;
      this.form.reset();
    }, 600);
  }
}
