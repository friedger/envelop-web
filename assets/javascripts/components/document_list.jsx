import PropTypes from 'prop-types';
import React, { Component } from "react";
import ReactDOM from "react-dom";

import GaiaDocument from '../lib/gaia_document';

import DocumentCardComponent from './document_card.jsx';

function sortDocuments(documents) {
  return documents.sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt)
  });
}

function DocumentListComponent(props) {
  return (
    <div className="ev-document-list ev-document-list-grid">
      <div className="ev-document-list-grid__inner">
        {sortDocuments(props.documents).map(doc => (
          <div className="ev-document-list-grid__cell" key={doc.uniqueKey()}>
            <DocumentCardComponent
              deleting={props.deleting === doc}
              doc={doc}
              onDelete={props.onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

DocumentListComponent.propTypes = {
  deleting: PropTypes.instanceOf(GaiaDocument),
  documents: PropTypes.arrayOf(PropTypes.instanceOf(GaiaDocument)).isRequired,
  onDelete: PropTypes.func.isRequired
};

export default DocumentListComponent;
