import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../../service/Post/post.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent {

  postForm!: FormGroup;
  //tags: string[] = [];
  selectedFile: File | null = null;


  constructor(private fb: FormBuilder,
              private router: Router,
              private postService: PostService) {}

    ngOnInit(): void {
      this.postForm = this.fb.group({
        clubName: [null, Validators.required],
        content: [null, [Validators.required, Validators.maxLength(5000)]],
        img: [null, [Validators.required, Validators.maxLength(5000)]],
        postedBy: [null,Validators.required],
        //tags: [[]]

      })
    }


      onFileSelected(video: any): void{
        this.selectedFile = video.target.files[0];
      }

      createPost(): void {
        if (this.postForm.valid && this.selectedFile) {
          const formData = new FormData();
          formData.append('img', this.selectedFile);

          const clubName = this.postForm.get('clubName')?.value;
          const postedBy = this.postForm.get('postedBy')?.value;
          const content = this.postForm.get('content')?.value;



          console.log('Form Values:');
          console.log('clubName:', clubName);
          console.log('postedBy:', postedBy);
          console.log('content:', content);



          if (clubName && postedBy && content  ) {
            formData.append('clubName', clubName);
            formData.append('postedBy', postedBy);
            formData.append('content', content);



            console.log('FormData:');
            console.log(formData);

            this.postService.createNewPost(formData).subscribe(() => {
              //alert("Event added successfully!");
              this.postForm.reset();
              this.selectedFile = null;
              this.router.navigateByUrl('viewallpost')
             Swal.fire(
                     'You informations!',
                     'saved with success',
                     'success'
                   )
            },
            error => {
              alert("An error occurred while adding vedio.");
              console.error(error);
            });
          } else {
            console.error("One or more form values are null.");
            return;
          }
        } else {
          // Error handling for form validation and file selection
        }
      }




}
