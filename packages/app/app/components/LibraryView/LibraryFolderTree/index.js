import React from 'react';
import {Grid} from 'react-redux-grid';
import {compose} from 'recompose';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import './styles.scss';

const LibraryFolderTree = ({
  tracks,
  localFolders
  /* sortBy,
  direction,
  handleSort,
  // estimateItemSize,
  t*/
}) => {
  const pathToEntryMap = {};
  let lastID = 0;
  function getEntryForPath(path) {
    if (pathToEntryMap[path] === undefined) {
      const newEntry = {
        id: ++lastID,
        path,
        name: path.split('/').slice(-1)[0],
        children: []
      };

      if (localFolders.includes(path)) {
        newEntry.parentId = -1;
      } else {
        const parentPath = path.split('/').slice(0, -1).join('/');
        if (parentPath.length === 0) {
          throw new Error('Parent path cannot be empty; the folder/file path-separators must not be normalized.');
        }
        const parent = getEntryForPath(parentPath);
        newEntry.parentId = parent.id;
        parent.children.push(newEntry);
      }

      pathToEntryMap[path] = newEntry;
    }
    return pathToEntryMap[path];
  }

  for (const track of tracks) {
    const folderPath = track.path.split('/').slice(0, -1).join('/');
    const folderEntry = getEntryForPath(folderPath);
    const newEntry = {
      id: ++lastID,
      parentId: folderEntry.id,
      path: track.path,
      name: track.name,
      album: track.album,
      artist: _.isString(track.artist) ? track.artist : track.artist.name
    };
    folderEntry.children.push(newEntry);
  }

  const data = {
    root: {
      id: -1,
      name: 'Root',
      children: Object.values(pathToEntryMap).filter(entry => localFolders.includes(entry.path))
    }
  };

  const treeConfig = {
    store: {
      getState: () => window.store.getState().reactReduxGrid,
      subscribe: window.store.subscribe,
      dispatch: window.store.dispatch
    },
    stateKey: 'local-library-folder-tree',
    gridType: 'tree', // either `tree` or `grid`,
    showTreeRootNode: false, // dont display root node of tree
    // pageSize: Object.values(pathToEntryMap).length,
    infinite: true,

    plugins: {
      COLUMN_MANAGER: {
        resizable: true,
        moveable: true
        /* sortable: {
          enabled: true,
          method: 'local',
          sortingSource: pagingDataSource
        }*/
      },
      EDITOR: {
        type: 'inline',
        enabled: true
      },
      PAGER: {
        enabled: false
      },
      LOADER: {
        enabled: true
      },
      SELECTION_MODEL: {
        mode: 'single'
      },
      ERROR_HANDLER: {
        defaultErrorMessage: 'AN ERROR OCURRED',
        enabled: true
      },
      GRID_ACTIONS: null,
      BULK_ACTIONS: {
        enabled: false
      }
    },
    columns: [
      {
        name: 'Name',
        width: '30%',
        className: 'additional-class',
        dataIndex: 'name',
        sortable: false,
        expandable: true
      },
      {
        name: 'Album',
        dataIndex: 'album',
        sortable: false,
        className: 'additional-class',
        defaultSortDirection: 'descend'
      },
      {
        name: 'Artist',
        dataIndex: 'artist',
        sortable: false,
        className: 'additional-class'
      }
    ],
    data
  };
  return <Grid {...treeConfig} />;
};

LibraryFolderTree.propTypes = {
  tracks: PropTypes.array,
  localFolders: PropTypes.arrayOf(PropTypes.string),
  sortBy: PropTypes.string,
  direction: PropTypes.string,
  handleSort: PropTypes.func
};

export default compose(
  withTranslation('library')
)(LibraryFolderTree);
