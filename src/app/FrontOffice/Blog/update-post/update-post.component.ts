import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../../service/Post/post.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-post',
  templateUrl: './update-post.component.html',
  styleUrls: ['./update-post.component.css']
})
export class UpdatePostComponent {

  postForm!: FormGroup;
  selectedFile: File | null = null;
  idPost!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.idPost = this.route.snapshot.params['id'];

    this.postForm = this.fb.group({
      clubName: [null, Validators.required],
      postedBy: [null, Validators.required],
      content: [null, [Validators.required, Validators.maxLength(5000)]],
      img: [null]
    });

    this.loadPostData();
  }

  loadPostData() {
    this.postService.getPostById(this.idPost).subscribe((post: any) => {
      this.postForm.patchValue({
        clubName: post.clubName,
        postedBy: post.postedBy,
        content: post.content
      });
    }, error => {
      console.error('Error loading post', error);
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  updatePost(): void {
    if (this.postForm.valid) {
      const formData = new FormData();
      formData.append('clubName', this.postForm.get('clubName')?.value);
      formData.append('postedBy', this.postForm.get('postedBy')?.value);
      formData.append('content', this.postForm.get('content')?.value);

      if (this.selectedFile) {
        formData.append('img', this.selectedFile);
      }

      this.postService.UpdatePost(formData, this.idPost).subscribe(() => {
        Swal.fire('Success', 'Post updated successfully!', 'success');
        this.router.navigateByUrl('/viewallpost');
      }, error => {
        console.error('Error updating post', error);
        Swal.fire('Error', 'Something went wrong!', 'error');
      });
    }
  }
}


