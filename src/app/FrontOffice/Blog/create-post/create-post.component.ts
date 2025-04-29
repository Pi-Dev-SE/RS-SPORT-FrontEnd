import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../../service/Post/post.service';
@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent {

  postForm!: FormGroup;
  //tags: string[] = [];


  constructor(private fb: FormBuilder, 
              private router: Router,
              private postService: PostService) {}

    ngOnInit(): void {
      this.postForm = this.fb.group({
        clubName: [null, Validators.required],
        content: [null, [Validators.required, Validators.maxLength(5000)]],
        img:[null,Validators.required],
        postedBy:[null,Validators.required],
        //tags: [[]]

      })
    }

    /*
    addTag(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();
    
        if (value) {
          this.tags.push(value);
          this.postForm.get('tags')?.setValue(this.tags); 
          input.value = '';
        }
        event.preventDefault();
      }
    }
    
    

    removeTag(index: number) {
      this.tags.splice(index, 1);
      this.postForm.patchValue({ tags: this.tags });
    }
    */

    createPost(){
      const data = this.postForm.value;
      //data.tags = this.tags;

      this.postService.createNewPost(data).subscribe( res => {
        console.log("Post created successfully !!!", "OK");
        //this.router.navigateByUrl("/");
      }, error => {
        console.log("Error creating post !!!", "OK");
      })
    }



}
