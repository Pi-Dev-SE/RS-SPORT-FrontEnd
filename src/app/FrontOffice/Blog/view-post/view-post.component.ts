import { CommentService } from './../../../service/Comment/comment.service';
import { Component } from '@angular/core';
import { PostService } from '../../../service/Post/post.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.css']
})
export class ViewPostComponent {

  postId = this.activatedRoute.snapshot.params['id'];
  postData: any;
  commentForm!: FormGroup;
  comments: any;
  showActions = false;


  constructor(
    private PostService: PostService,
    private CommentService: CommentService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    console.log(this.postId);
    this.getPostById();
    this.commentForm = this.fb.group({
      postedBy: [null, Validators.required],
      content: [null, Validators.required]
    });
  }

  getCommentsByPost() {
    this.CommentService.getAllCommentsByPost(this.postId).subscribe(response => {
      this.comments = response;
    }, error => {
      console.log('Something Went Wrong!!!!', 'Ok');
    });
  }

  getPostById() {
    this.PostService.getPostById(this.postId).subscribe(response => {
      this.postData = response;
      console.log(response);
      this.getCommentsByPost();
    }, error => {
      console.log('Something Went Wrong!!!!', 'Ok');
    });
  }

  publishComment() {
    const postedBy = this.commentForm.get('postedBy')?.value;
    const content = this.commentForm.get('content')?.value;

    this.CommentService.createComment(this.postId, postedBy, content).subscribe(
      res => {
        Swal.fire('Your information!', 'Saved with success', 'success');
        this.getCommentsByPost();
        this.commentForm.reset();
      },
      error => {
        if (error.status === 400) {
          Swal.fire('Error', error.error, 'error');
        } else {
          Swal.fire('Something went wrong!', 'Please try again later.', 'error');
        }
      }
    );
  }

  deletePost() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this post?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.PostService.deletePost(this.postId).subscribe(() => {
          Swal.fire(
            'Deleted!',
            'The post has been deleted.',
            'success'
          ).then(() => {
            window.location.href = '/viewallpost';
          });
        }, error => {
          console.log("Error while deleting post", error);
          Swal.fire('Oops!', 'Something went wrong.', 'error');
        });
      }
    });
  }


  deleteComment(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this comment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.CommentService.deleteComment(id).subscribe(() => {
          Swal.fire('Deleted!', 'Comment has been deleted.', 'success');
          this.getCommentsByPost();
        }, error => {
          Swal.fire('Error!', 'Could not delete comment.', 'error');
        });
      }
    });
  }
  joinMeeting() {
    const roomName = `PostRoom_${this.postId}`;
    window.open(`https://meet.jit.si/${roomName}`, '_blank');
  }

  toggleActions() {
    this.showActions = !this.showActions;
  }


}
