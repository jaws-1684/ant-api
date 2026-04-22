import express from 'express';
import messageService from '../services/messageService.ts';
import type { MessageEntry } from '../types.ts';
import type { Response } from 'express';
import Message from '../models/message.ts';
const router = express.Router();

router.get('/', (_req, res: Response<MessageEntry[]>) => {
  res.send(messageService.getMessages());
});

router.get('/:id', (request: { params: { id: string } }, response, next) => {
  Message.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

// router.post('/', (_req, res) => {
//   if (!body.content) {
//   return response.status(400).json({ 
//     error: 'content missing' 
//   })
// }
// });
// const notesRouter = require('express').Router()
// const Note = require('../models/note')

// notesRouter.get('/', (request, response) => {
//   Note.find({}).then(notes => {
//     response.json(notes)
//   })
// })

// notesRouter.get('/:id', (request, response, next) => {
//   Note.findById(request.params.id)
//     .then(note => {
//       if (note) {
//         response.json(note)
//       } else {
//         response.status(404).end()
//       }
//     })
//     .catch(error => next(error))
// })

// notesRouter.post('/', (request, response, next) => {
//   const body = request.body

//   const note = new Note({
//     content: body.content,
//     important: body.important || false,
//   })

//   note.save()
//     .then(savedNote => {
//       response.json(savedNote)
//     })
//     .catch(error => next(error))
// })

// notesRouter.delete('/:id', (request, response, next) => {
//   Note.findByIdAndDelete(request.params.id)
//     .then(() => {
//       response.status(204).end()
//     })
//     .catch(error => next(error))
// })

// notesRouter.put('/:id', (request, response, next) => {
//   const { content, important } = request.body

//   Note.findById(request.params.id)
//     .then(note => {
//       if (!note) {
//         return response.status(404).end()
//       }

//       note.content = content
//       note.important = important

//       return note.save().then((updatedNote) => {
//         response.json(updatedNote)
//       })
//     })
//     .catch(error => next(error))
// })

// module.exports = notesRouter

export default router;