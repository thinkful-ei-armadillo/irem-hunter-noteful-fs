import React, { Component } from 'react'
import NotefulForm from '../NotefulForm/NotefulForm'
import './AddNote.css';
import config from '../config';
import context from '../context';

export default class AddNote extends Component {
  constructor(props){
    super(props)
    this.state = {
    folderId:'',
    name: '',
    content: ''
  }
}
  static contextType = context;
  
  chooseId(folderId) {
    this.setState({folderId: Number(folderId)})};

  setName(name){
    this.setState({name})};

  setContent(content){
    this.setState({content});
  }

  handleSubmit =(e) => {
    e.preventDefault();
    const newNote={
      name: this.state.name,
      content: this.state.content,
      folderid: this.state.folderId,
      modified: new Date(),
    };
    console.log(newNote);
    fetch(`${config.API_ENDPOINT}/noteful`,{
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${config.API_KEY}`
      },
      body: JSON.stringify(newNote),
    })
    .then(res =>{
      console.log(res)
      if(res.ok) {
        console.log(res)
        return res.json()}
      else  throw new Error(res.status);
      })
    .then(note => {
      console.log(note)
      this.context.addNote(note)
      this.props.history.push('/')
    })
    .catch(error => console.error({error}) );
  };

  render() {
    const { folders } = this.props;
    return (
      <section className='AddNote'>
        <h2>Create a note</h2>
        <NotefulForm onSubmit={this.handleSubmit}>
          <div className='field'>
            <label htmlFor='note-name-input'>
              Name
            </label>
            <input type='text' id='note-name-input' onChange={(e)=> this.setName(e.target.value)}/>
          </div>
          <div className='field'>
            <label htmlFor='note-content-input'>
              Content
            </label>
            <input type='text' id='note-content-input' onChange={(e)=> this.setContent(e.target.value)} />
          </div>
          <div className='field'>
            <label htmlFor='note-folder-select'>
              Folder
            </label>
            <select id='note-folder-select' onChange={(e)=> this.chooseId(e.target.value)}>
              <option value={null}>...</option>
              {folders.map(folder =>
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              )}
            </select>
          </div>
          <div className='buttons'>
            <button type='submit'>
              Add note
            </button>
          </div>
        </NotefulForm>
      </section>
    )
  }
}
