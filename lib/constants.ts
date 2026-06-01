import { Certificate } from './types';

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'c1',
    imageUrl: '/certificates/cs50x.png',
    duration: '12 weeks',
    topics: 'Computer Science, Algorithms, Data Structures',
    issuer: 'Harvard University (edX)',
    onlineUrl : "#",
  },
  {
    id: 'c2',
    imageUrl: '/certificates/jsb.png',
    duration: '8 weeks',
    topics: 'JavaScript Basics, DOM, ES6',
    issuer: 'freeCodeCamp',
    onlineUrl : "#",
  },
  {
    id: 'c3',
    imageUrl: '/certificates/psb.png',
    duration: '10 weeks',
    topics: 'Problem Solving, Data Structures, Python',
    issuer: 'InterviewBit Academy',
    onlineUrl : "#",
  },
  {
    id: 'c4',
    imageUrl: '/certificates/pyb.png',
    duration: '6 weeks',
    topics: 'Python Programming, OOP, Scripting',
    issuer: 'Coursera',
    onlineUrl : "#",
  },
  {
    id: 'c5',
    imageUrl: '/certificates/rapi.png',
    duration: '5 weeks',
    topics: 'REST APIs, Authentication, Backend Design',
    issuer: 'Udemy',
    onlineUrl : "#",
  },
  {
    id: 'c6',
    imageUrl: '/certificates/sqlb.png',
    duration: '7 weeks',
    topics: 'SQL Queries, Database Design, Optimization',
    issuer: 'Pluralsight',
    onlineUrl : "#",
  },
];
