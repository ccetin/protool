'use strict'

class Digraph {
  constructor(options) {
    this.options = options || {}
    this.adjacencyList = {}
    this.isCyclic = null
  }

  adjacent(v) {
    return this.adjacencyList[v] || {}
  }

  adjacentList(v) {
    return Object.keys(this.adjacent(v))
  }

  isAdjacent(u, v) {
    return this.adjacencyList[u] && this.adjacencyList[u][v]
  }

  addVertex(v) {
    this.adjacencyList[v] = this.adjacent(v)
    return this
  }

  addEdge(u, v) {
    this.addVertex(u)
    this.addVertex(v)
    this.adjacent(u)[v] = true
    this.isCyclic = null
    return this
  }

  removeVertex(v) {
    Object.keys(this.adjacencyList).forEach( (u) => {
      this.adjacentList(u).forEach( (w) => {
        if (w === v) {
          this.removeEdge(u, w)
        }
      })
    })
    delete this.adjacencyList[v]
    return this
  }

  removeEdge(u, v) {
    if (this.adjacencyList[u]) {
      const _adjacent = this.adjacent(u)
      delete _adjacent[v]
      this.adjacencyList[u] = _adjacent
    }
    this.isCyclic = null
    return this
  }

  vertices() {
    return Object.keys(this.adjacencyList)
  }

  reverse() {
    const graph = new Digraph()
    this.vertices().forEach( (v) => {
      this.adjacent(v).forEach( (u) => {
        graph.addEdge(u, v)
      })
    })
    return graph
  }

  depthFirstOrder() {
    const preOrder = []
    const postOrder = []
    const marked = {}
    const visit = (v) => {
      preOrder.push(v)
      marked[v] = true
      this.adjacentList(v).forEach( (u) => {
        if (!marked[u]) {
          visit(u)
        }
      })
      postOrder.push(v)
    }
    this.vertices().forEach( (v) => {
      if (!marked[v]) {
        visit(v)
      }
    })
    return {
      preOrder:  preOrder,
      postOrder: postOrder
    }
  }

  hasCycle() {
    if (this.isCyclic !== null) {
      return this.isCyclic
    }

    let _hasCycle = false
    const isVisited = {}
    const marked = {}
    const visit = (v) => {
      if (_hasCycle) {
        return
      }
      isVisited[v] = true
      marked[v] = true
      this.adjacentList(v).forEach( (u) => {
        if (_hasCycle) {
          return
        } else if (!marked[u]) {
          visit(u)
        } else if (isVisited[u]) {
          _hasCycle = true
        }
      })
      isVisited[v] = false
    }
    this.vertices().forEach( (v) => {
      if (!marked[v]) {
        visit(v)
      }
    })
    this.isCyclic = _hasCycle
    return this.isCyclic
  }

  topologicalSort() {
    if (this.hasCycle()) {
      throw new Error('Topological sort cannot be computed for cyclic directed graph')
    }
    const orders = this.depthFirstOrder()
    return orders.postOrder
  }

}

module.exports = Digraph
